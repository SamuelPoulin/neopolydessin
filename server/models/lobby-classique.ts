import { injectable } from 'inversify';
import { Server, Socket } from 'socket.io';
import { PictureWordService } from '../app/services/picture-word.service';
import { DatabaseService } from '../app/services/database.service';
import { SocketIdService } from '../app/services/socket-id.service';
import {
  CurrentGameState,
  Difficulty,
  GameType,
  GuessMessage,
  GuessResponse,
  PlayerRole
} from '../../common/communication/lobby';
import { SocketLobby } from '../../common/socketendpoints/socket-lobby';
import { levenshtein } from '../app/utils/levenshtein-distance';
import { Lobby, ServerPlayer } from './lobby';


@injectable()
export class LobbyClassique extends Lobby {

  private readonly START_GAME_TIME_LEFT: number = 30;
  private readonly REPLY_TIME: number = 10;
  private clockTimeout: NodeJS.Timeout;
  private teamDrawing: number;
  private playerDrawing: number;
  private drawerPlayer: ServerPlayer;

  constructor(
    socketIdService: SocketIdService,
    databaseService: DatabaseService,
    pictureWordService: PictureWordService,
    io: Server,
    accountId: string,
    difficulty: Difficulty,
    privateGame: boolean,
    lobbyName: string
  ) {
    super(socketIdService, databaseService, pictureWordService, io, accountId, difficulty, privateGame, lobbyName);
    this.teams = [{ teamNumber: 0, currentScore: 0, playersInTeam: [] }, { teamNumber: 1, currentScore: 0, playersInTeam: [] }];
    this.gameType = GameType.CLASSIC;
    this.timeLeftSeconds = this.START_GAME_TIME_LEFT;
    this.teamDrawing = 0;
    this.playerDrawing = 0;
  }

  addPlayer(playerId: string, status: PlayerRole, socket: Socket) {
    const teamNumber = (this.teams[0].playersInTeam.length <= this.teams[1].playersInTeam.length) ? 0 : 1;
    this.addPlayerToTeam(playerId, status, socket, teamNumber)
      .then(() => {
        this.bindLobbyEndPoints(socket);
      })
      .catch((err) => {
        console.error(`There was an error when adding ${playerId} : ${err}`);
      });
  }

  changeTeam(accountId: string, teamNumber: number) {
    const index = this.players.findIndex((player) => player.accountId === accountId);
    if (index < -1 && this.teams[teamNumber].playersInTeam.length < (this.size / 2)) {
      const oldTeamIndex = this.teams[this.players[index].teamNumber].playersInTeam.findIndex((player) => player.accountId === accountId);
      if (oldTeamIndex) {
        this.teams[this.players[index].teamNumber].playersInTeam.splice(oldTeamIndex, 1);
      }
      this.players[index].teamNumber = teamNumber;
      this.teams[teamNumber].playersInTeam.push(this.players[index]);
    }
  }

  protected bindLobbyEndPoints(socket: Socket) {

    super.bindLobbyEndPoints(socket);

    socket.on(SocketLobby.PLAYER_GUESS, (word: string) => {
      const guesserAccountId = this.socketIdService.GetAccountIdOfSocketId(socket.id);
      const guesserValues = this.players.find((element) => element.accountId === guesserAccountId);
      if (guesserValues?.playerRole === PlayerRole.GUESSER) {
        const distance = levenshtein(word, this.wordToGuess);
        let guessStat;
        switch (distance) {
          case 0: {
            guessStat = GuessResponse.CORRECT;
            this.teams[guesserValues.teamNumber].currentScore++;
            this.playerDrawing++;
            this.teamDrawing++;
            this.startRoundTimer();
            break;
          }
          case 1:
          case 2: {
            guessStat = GuessResponse.CLOSE;
            this.startReply();
            break;
          }
          default: {
            guessStat = GuessResponse.WRONG;
            this.startReply();
            break;
          }
        }
        const player = this.findPlayerBySocket(socket);
        if (player) {
          const guessReturn: GuessMessage = {
            content: word,
            timestamp: Date.now(),
            guessStatus: guessStat,
            senderUsername: player.username
          };
          this.io.in(this.lobbyId).emit(SocketLobby.CLASSIQUE_GUESS_BROADCAST, guessReturn);
        }
      }
    });

    socket.on(SocketLobby.START_GAME_SERVER, () => {
      const senderAccountId = this.socketIdService.GetAccountIdOfSocketId(socket.id);
      if (senderAccountId === this.ownerAccountId) {
        this.io.in(this.lobbyId).emit(SocketLobby.START_GAME_CLIENT);
        this.currentGameState = CurrentGameState.IN_GAME;
      }
    });
  }

  protected unbindLobbyEndPoints(socket: Socket) {
    super.unbindLobbyEndPoints(socket);
    socket.removeAllListeners(SocketLobby.PLAYER_GUESS);
    socket.removeAllListeners(SocketLobby.START_GAME_SERVER);
  }


  protected startRoundTimer() {
    // DECIDE ROLES
    // SEND ROLES TO CLIENT
    // SEND WORD TO DRAWER
    // START TIMER AND SEND TIME TO CLIENT
    this.setRoles();
    console.log('Word to guess before await: ' + this.wordToGuess);
    this.pictureWordService.getRandomWord().then((wordStructure) => {
      this.wordToGuess = wordStructure.word;
      this.io.to(this.drawerPlayer.socket.id).emit(SocketLobby.UPDATE_WORD_TO_DRAW, wordStructure.word);
      console.log('Word to guess in await: ' + this.wordToGuess);
    });
    console.log('Word to guess after await: ' + this.wordToGuess);

    clearInterval(this.clockTimeout);

    this.currentGameState = CurrentGameState.DRAWING;
    this.timeLeftSeconds = this.START_GAME_TIME_LEFT;
    this.startTimerGuessToClient();

    this.clockTimeout = setInterval(() => {
      --this.timeLeftSeconds;
      console.log(this.timeLeftSeconds);
      if (this.timeLeftSeconds <= 0) {
        this.endRoundTimer();
        this.startReply();
      }
    }, this.MS_PER_SEC);
  }

  private endRoundTimer() {
    clearInterval(this.clockTimeout);
    console.log('Guess over');
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
      console.log(this.timeLeftSeconds);
      if (this.timeLeftSeconds <= 0) {
        this.endReplyTimer();
      }
    }, this.MS_PER_SEC);
  }

  private endReplyTimer() {
    clearInterval(this.clockTimeout);
    console.log('Reply over');
    this.playerDrawing++;
    this.teamDrawing++;
    this.startRoundTimer();
  }

  private startTimerGuessToClient() {
    const gameStartTime = Date.now() + this.timeLeftSeconds * this.MS_PER_SEC;
    this.io.in(this.lobbyId).emit(SocketLobby.SET_TIME, gameStartTime);
  }

  private startTimerReplyToClient() {
    const replyTimeSeconds = this.REPLY_TIME;
    const timerValue = Date.now() + replyTimeSeconds * this.MS_PER_SEC;
    this.io.in(this.lobbyId).emit(SocketLobby.SET_TIME, timerValue);
  }

  private setRoles() {
    const indexTeamDrawing = this.teamDrawing % 2;
    const indexPlayerDrawing = this.playerDrawing % 2;
    this.teams.forEach((team, indexTeam) => {
      team.playersInTeam.forEach((player, indexPlayer) => {
        if (indexTeamDrawing === indexTeam) {
          const botPlayer = this.findBotPlayerInTeam(indexTeam);
          let shouldBeDrawer;
          if (botPlayer) {
            shouldBeDrawer = indexPlayer === botPlayer;
          }
          else {
            shouldBeDrawer = indexPlayer === indexPlayerDrawing;
          }
          if (shouldBeDrawer) {
            player.playerRole = PlayerRole.DRAWER;
            this.drawerPlayer = player;
          }
          else {
            player.playerRole = PlayerRole.GUESSER;
          }
        }
        else {
          player.playerRole = PlayerRole.PASSIVE;
        }
      });
    });
    this.io.in(this.lobbyId).emit(SocketLobby.UPDATE_ROLES, this.toLobbyInfo());
  }

  private setReplyRoles() {
    const indexTeamDrawing = this.teamDrawing % 2;
    this.teams.forEach((team, indexTeam) => {
      team.playersInTeam.forEach((player, indexPlayer) => {
        if (indexTeamDrawing === indexTeam) {
          player.playerRole = PlayerRole.PASSIVE;
        }
        else {
          player.playerRole = PlayerRole.GUESSER;
        }
      });
    });
    this.io.in(this.lobbyId).emit(SocketLobby.UPDATE_ROLES, this.toLobbyInfo());
  }

  private findBotPlayerInTeam(teamIndex: number): number | undefined {
    let indexBotPlayer;
    this.teams[teamIndex].playersInTeam.forEach((player, index) => {
      if (player.isBot) {
        indexBotPlayer = index;
      }
    });
    return indexBotPlayer;
  }
}