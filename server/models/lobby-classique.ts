import { injectable } from 'inversify';
import { Server, Socket } from 'socket.io';
import { PictureWordService } from '../app/services/picture-word.service';
import { DatabaseService } from '../app/services/database.service';
import { SocketIdService } from '../app/services/socket-id.service';
import {
  CurrentGameState,
  Difficulty,
  Entity,
  GameType,
  GuessMessage,
  GuessResponse,
  instanceOfPlayer,
  Player,
  PlayerRole,
  ReasonEndGame
} from '../../common/communication/lobby';
import { SocketLobby } from '../../common/socketendpoints/socket-lobby';
import { levenshtein } from '../app/utils/levenshtein-distance';
import { Lobby, ServerPlayer } from './lobby';


@injectable()
export class LobbyClassique extends Lobby {

  protected clockTimeout: NodeJS.Timeout;
  private readonly START_GAME_TIME_LEFT: number = 30;
  private readonly REPLY_TIME: number = 15;
  private readonly END_SCORE: number = 5;
  private drawingTeamNumber: number;
  private drawers: Entity[];

  constructor(
    socketIdService: SocketIdService,
    databaseService: DatabaseService,
    pictureWordService: PictureWordService,
    io: Server,
    difficulty: Difficulty,
    privateGame: boolean,
    lobbyName: string
  ) {
    super(socketIdService, databaseService, pictureWordService, io, difficulty, privateGame, lobbyName);
    this.gameType = GameType.CLASSIC;
    this.size = this.GAME_SIZE_MAP.get(this.gameType) as number;
    this.timeLeftSeconds = this.START_GAME_TIME_LEFT;
    this.teamScores = [0, 0];
    this.drawingTeamNumber = 0;
    this.drawers = [];
  }

  addPlayer(playerId: string, socket: Socket) {
    const teamNumber = (this.getTeamLength(0) <= this.getTeamLength(1)) ? 0 : 1;
    this.addPlayerToTeam(playerId, socket, teamNumber)
      .then(() => {
        this.bindLobbyEndPoints(socket);
      })
      .catch((err) => {
        console.error(`There was an error when adding ${playerId} : ${err}`);
      });
  }

  changeTeam(accountId: string, teamNumber: number) {
    const index = this.players.findIndex((player) => (player as Player).accountId === accountId);
    if (index > -1
      && this.players[index].teamNumber !== teamNumber
      && this.getTeamLength(teamNumber) < this.size / 2
    ) {
      this.players[index].teamNumber = teamNumber;
    }
  }

  protected startGame(): void {
    this.startRoundTimer();
  }

  protected bindLobbyEndPoints(socket: Socket) {

    super.bindLobbyEndPoints(socket);

    socket.on(SocketLobby.PLAYER_GUESS, (word: string) => {
      const accountId = this.socketIdService.GetAccountIdOfSocketId(socket.id);
      const guessers = this.getGuessers();
      if (guessers) {
        const guesser = guessers.find((player) => player.accountId === accountId);
        if (guesser) {
          const distance = levenshtein(word, this.wordToGuess);
          let guessStatus: GuessResponse;
          switch (distance) {
            case 0: {
              guessStatus = GuessResponse.CORRECT;
              this.teamScores[guesser.teamNumber]++;
              this.io.in(this.lobbyId).emit(SocketLobby.UPDATE_TEAMS_SCORE, this.getTeamsScoreArray());
              if (this.teamScores[guesser.teamNumber] === this.END_SCORE) {
                this.endGame(ReasonEndGame.WINNING_SCORE_REACHED);
              }
              this.drawingTeamNumber = (this.drawingTeamNumber + 1) % 2;
              this.startRoundTimer();
              break;
            }
            case 1:
            case 2: {
              guessStatus = GuessResponse.CLOSE;
              this.startReply();
              break;
            }
            default: {
              guessStatus = GuessResponse.WRONG;
              this.startReply();
              break;
            }
          }
          const guessReturn: GuessMessage = {
            content: word,
            timestamp: Date.now(),
            guessStatus,
            senderUsername: guesser.username
          };
          this.io.in(this.lobbyId).emit(SocketLobby.CLASSIQUE_GUESS_BROADCAST, guessReturn);
        }
      }
    });
  }

  protected unbindLobbyEndPoints(socket: Socket) {
    super.unbindLobbyEndPoints(socket);
    socket.removeAllListeners(SocketLobby.PLAYER_GUESS);
  }

  protected startRoundTimer() {
    // DECIDE ROLES
    // SEND ROLES TO CLIENT
    // SEND WORD TO DRAWER
    // START TIMER AND SEND TIME TO CLIENT
    this.setRoles();
    this.drawingCommands.resetDrawing();
    this.pictureWordService.getRandomWord().then((wordStructure) => {
      this.wordToGuess = wordStructure.word;
      const drawer = this.drawers[this.drawingTeamNumber];
      if (instanceOfPlayer(drawer)) {
        this.io.to((drawer as ServerPlayer).socket.id).emit(SocketLobby.UPDATE_WORD_TO_DRAW, wordStructure.word);
      }
    });

    clearInterval(this.clockTimeout);

    this.currentGameState = CurrentGameState.DRAWING;
    this.timeLeftSeconds = this.START_GAME_TIME_LEFT;
    this.startTimerGuessToClient();

    this.clockTimeout = setInterval(() => {
      --this.timeLeftSeconds;
      if (this.timeLeftSeconds <= 0) {
        this.endRoundTimer();
        this.startReply();
      }
    }, this.MS_PER_SEC);
  }

  private endRoundTimer() {
    clearInterval(this.clockTimeout);
  }

  private startReply() {
    // SEND REPLY PHASE TO CLIENTS WITH ROLES (GUESS-GUESS / PASSIVE-PASSIVE)
    // SEND TIME TO CLIENT (10 SECONDS)
    clearInterval(this.clockTimeout);
    this.setReplyRoles();

    this.currentGameState = CurrentGameState.REPLY;
    this.timeLeftSeconds = this.REPLY_TIME;
    this.startTimerReplyToClient();

    this.clockTimeout = setInterval(() => {
      --this.timeLeftSeconds;
      if (this.timeLeftSeconds <= 0) {
        this.endReplyTimer();
      }
    }, this.MS_PER_SEC);
  }

  private endReplyTimer() {
    clearInterval(this.clockTimeout);
    this.drawingTeamNumber = (this.drawingTeamNumber + 1) % 2;
    this.startRoundTimer();
  }

  private startTimerGuessToClient() {
    const gameStartTime = Date.now() + this.timeLeftSeconds * this.MS_PER_SEC;
    this.io.in(this.lobbyId).emit(SocketLobby.SET_TIME, { serverTime: Date.now(), timestamp: gameStartTime });
  }

  private startTimerReplyToClient() {
    const replyTimeSeconds = this.REPLY_TIME;
    const timerValue = Date.now() + replyTimeSeconds * this.MS_PER_SEC;
    this.io.in(this.lobbyId).emit(SocketLobby.SET_TIME, { serverTime: Date.now(), timestamp: timerValue });
  }

  private setRoles() {
    let newDrawer: Entity | undefined;
    this.players.forEach((player) => {
      if (player.teamNumber === this.drawingTeamNumber) {
        if (player.isBot) {
          player.playerRole = PlayerRole.DRAWER;
          newDrawer = player;
        } else {
          player.playerRole = PlayerRole.PASSIVE;
        }
      }
    });
    this.players.forEach((player) => {
      if (!player.isBot && player.teamNumber === this.drawingTeamNumber) {
        if (!newDrawer) {
          const previousDrawer = this.drawers[this.drawingTeamNumber];
          if (previousDrawer) {
            if (previousDrawer.username !== player.username) {
              player.playerRole = PlayerRole.DRAWER;
              newDrawer = player;
            } else {
              player.playerRole = PlayerRole.GUESSER;
            }
          } else {
            player.playerRole = PlayerRole.DRAWER;
            newDrawer = player;
          }
        } else {
          player.playerRole = PlayerRole.GUESSER;
        }
      }
    });
    if (newDrawer) {
      this.drawers[this.drawingTeamNumber] = newDrawer;
    }
    this.io.in(this.lobbyId).emit(SocketLobby.UPDATE_ROLES, this.toLobbyInfo());
  }

  private setReplyRoles() {
    this.players.forEach((player) => {
      if (player.teamNumber === this.drawingTeamNumber) {
        player.playerRole = PlayerRole.PASSIVE;
      } else {
        player.playerRole = PlayerRole.GUESSER;
      }
    });
    this.io.in(this.lobbyId).emit(SocketLobby.UPDATE_ROLES, this.toLobbyInfo());
  }

  private getGuessers(): Player[] | undefined {
    return this.players.filter((player) => !player.isBot && player.playerRole === PlayerRole.GUESSER) as Player[];
  }
}