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
import { DifficultyModifiers, Lobby, ServerPlayer } from './lobby';


@injectable()
export class LobbyClassique extends Lobby {

  protected clockTimeout: NodeJS.Timeout;

  private readonly END_SCORE: number = 5;
  private drawingTeamNumber: number;
  private drawers: Entity[];

  private guessTries: number;
  private guessLeft: number;

  private drawPhaseTime: number;
  private replyPhaseTime: number;

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
    const diffMods = this.DIFFICULTY_MODIFIERS.get(difficulty) as DifficultyModifiers;
    this.guessTries = diffMods.guessTries;
    this.guessLeft = this.guessTries;
    this.drawPhaseTime = diffMods.classicTime;
    this.replyPhaseTime = diffMods.replyTime;
    this.timeLeftSeconds = this.drawPhaseTime;
    this.teamScores = [0, 0];
    this.drawingTeamNumber = -1;
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

      const guesser = this.players.find((player) => !player.isBot
        && player.playerRole === PlayerRole.GUESSER
        && (player as ServerPlayer).accountId === accountId);

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
            this.startRoundTimer();
            break;
          }
          case 1:
          case 2: {
            guessStatus = GuessResponse.CLOSE;
            this.guessLeft--;
            if (this.currentGameState === CurrentGameState.REPLY) {
              this.startRoundTimer();
            } else {
              if (this.guessLeft <= 0) {
                this.startReply();
              }
            }
            break;
          }
          default: {
            guessStatus = GuessResponse.WRONG;
            this.guessLeft--;
            if (this.currentGameState === CurrentGameState.REPLY) {
              this.startRoundTimer();
            } else {
              if (this.guessLeft <= 0) {
                this.startReply();
              }
            }
            break;
          }
        }
        const guessReturn: GuessMessage = {
          content: word,
          timestamp: Date.now(),
          guessStatus,
          senderUsername: guesser.username
        };
        this.io.in(this.lobbyId).emit(SocketLobby.GUESS_BROADCAST, guessReturn);
        this.botService.playerGuess(guessStatus, this.guessTries, this.guessLeft);
      }
    });
  }

  protected startRoundTimer() {
    this.drawingTeamNumber = (this.drawingTeamNumber + 1) % 2;
    this.guessLeft = this.guessTries;
    this.setRoles();
    this.drawingCommands.resetDrawing();
    this.pictureWordService.getRandomWord(this.difficulty).then((pictureWord) => {
      this.wordToGuess = pictureWord.word;
      const drawer = this.drawers[this.drawingTeamNumber];
      if (instanceOfPlayer(drawer)) {
        this.io.to((drawer as ServerPlayer).socket.id).emit(SocketLobby.UPDATE_WORD_TO_DRAW, pictureWord.word);
      } else {
        this.botService.draw(pictureWord.sequence, pictureWord.hints);
      }
    });

    clearInterval(this.clockTimeout);

    this.io.in(this.lobbyId).emit(SocketLobby.UPDATE_GAME_STATE, CurrentGameState.DRAWING);
    this.currentGameState = CurrentGameState.DRAWING;
    this.timeLeftSeconds = this.drawPhaseTime;
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
    if (this.drawers[this.drawingTeamNumber].isBot) {
      this.botService.resetDrawing();
    }

    clearInterval(this.clockTimeout);
    this.setReplyRoles();

    this.io.in(this.lobbyId).emit(SocketLobby.UPDATE_GAME_STATE, CurrentGameState.REPLY);
    this.currentGameState = CurrentGameState.REPLY;
    this.timeLeftSeconds = this.replyPhaseTime;
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
    this.startRoundTimer();
  }

  private startTimerGuessToClient() {
    const gameStartTime = Date.now() + this.timeLeftSeconds * this.MS_PER_SEC;
    this.io.in(this.lobbyId).emit(SocketLobby.SET_TIME, { serverTime: Date.now(), timestamp: gameStartTime });
  }

  private startTimerReplyToClient() {
    const replyTimeSeconds = this.replyPhaseTime;
    const timerValue = Date.now() + replyTimeSeconds * this.MS_PER_SEC;
    this.io.in(this.lobbyId).emit(SocketLobby.SET_TIME, { serverTime: Date.now(), timestamp: timerValue });
  }

  private setRoles() {
    const teams: Entity[][] = [];
    teams[0] = this.players.filter((player) => player.teamNumber === 0);
    teams[1] = this.players.filter((player) => player.teamNumber === 1);

    teams[(this.drawingTeamNumber + 1) % 2].forEach((player) => player.playerRole = PlayerRole.PASSIVE);

    const botInDrawingTeam = teams[this.drawingTeamNumber].findIndex((player) => player.isBot);
    if (botInDrawingTeam > -1) {
      this.botService.currentBot = this.drawingTeamNumber;
      teams[this.drawingTeamNumber][botInDrawingTeam].playerRole = PlayerRole.DRAWER;
      this.drawers[this.drawingTeamNumber] = teams[this.drawingTeamNumber][botInDrawingTeam];
      teams[this.drawingTeamNumber][(botInDrawingTeam + 1) % 2].playerRole = PlayerRole.GUESSER;
    } else {
      const previousDrawerIndex = teams[this.drawingTeamNumber].findIndex((player) => player === this.drawers[this.drawingTeamNumber]);
      if (previousDrawerIndex > -1) {
        teams[this.drawingTeamNumber][previousDrawerIndex].playerRole = PlayerRole.GUESSER;
        teams[this.drawingTeamNumber][(previousDrawerIndex + 1) % 2].playerRole = PlayerRole.DRAWER;
        this.drawers[this.drawingTeamNumber] = teams[this.drawingTeamNumber][(previousDrawerIndex + 1) % 2];
      } else {
        teams[this.drawingTeamNumber][0].playerRole = PlayerRole.DRAWER;
        this.drawers[this.drawingTeamNumber] = teams[this.drawingTeamNumber][0];
        teams[this.drawingTeamNumber][1].playerRole = PlayerRole.GUESSER;
      }
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
}