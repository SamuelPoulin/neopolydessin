import { injectable } from 'inversify';
import { Server, Socket } from 'socket.io';
import { DatabaseService } from '../app/services/database.service';
import { SocketIdService } from '../app/services/socket-id.service';
import { CurrentGameState, Difficulty, GameType, PlayerStatus } from '../../common/communication/lobby';
import { SocketLobby } from '../../common/socketendpoints/socket-lobby';
import { Lobby } from './lobby';


@injectable()
export class LobbyClassique extends Lobby {

  private clockTimeout: NodeJS.Timeout;

  constructor(socketIdService: SocketIdService,
    databaseService: DatabaseService,
    io: Server,
    accountId: string,
    difficulty: Difficulty,
    privateGame: boolean,
    lobbyName: string
  ) {
    super(socketIdService, databaseService, io, accountId, difficulty, privateGame, lobbyName);
    this.teams = [{ teamNumber: 0, currentScore: 0, playersInTeam: [] }, { teamNumber: 1, currentScore: 0, playersInTeam: [] }];
    this.gameType = GameType.CLASSIC;
    this.timeLeftSeconds = 30;
  }

  addPlayer(playerId: string, status: PlayerStatus, socket: Socket) {
    const teamNumber = (this.teams[0].playersInTeam.length <= this.teams[1].playersInTeam.length) ? 0 : 1;
    this.addPlayerToTeam(playerId, status, socket, teamNumber)
      .then(() => {
        this.bindLobbyEndPoints(socket);
      })
      .catch((err) => {
        console.error(`There was an error when adding ${playerId} : ${err}`);
      });
  }

  changeTeam(accountId: string, socket: Socket, teamNumber: number) {
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

    socket.on(SocketLobby.PLAYER_GUESS, (word: string, callback: (guessResponse: boolean) => void) => {
      const guesserAccountId = this.socketIdService.GetAccountIdOfSocketId(socket.id);
      const guesserValues = this.players.find((element) => element.accountId === guesserAccountId);
      if (guesserValues?.playerStatus === PlayerStatus.GUESSER) {
        if (word === this.wordToGuess) {
          this.teams[guesserValues.teamNumber].currentScore++;
          callback(true);
        }
        else {
          callback(false);
        }
      }
    });

    socket.on(SocketLobby.START_GAME_SERVER, () => {
      const senderAccountId = this.socketIdService.GetAccountIdOfSocketId(socket.id);
      if (senderAccountId === this.ownerAccountId) {
        this.io.in(this.lobbyId).emit(SocketLobby.START_GAME_CLIENT);
        this.currentGameState = CurrentGameState.IN_GAME;
        this.startRoundTimer();
      }
    });
  }

  protected unbindLobbyEndPoints(socket: Socket) {
    super.unbindLobbyEndPoints(socket);
    socket.removeAllListeners(SocketLobby.PLAYER_GUESS);
    socket.removeAllListeners(SocketLobby.START_GAME_SERVER);
  }


  private startRoundTimer() {
    // DECIDE ROLES
    // SEND ROLES TO CLIENT
    // SEND WORD TO DRAWER
    // START TIMER AND SEND TIME TO CLIENT
    clearInterval(this.clockTimeout);
    this.currentGameState = CurrentGameState.DRAWING;
    this.timeLeftSeconds = 30;
    this.startTimerGuessToClient();
    this.clockTimeout = setInterval(() => {
      --this.timeLeftSeconds;
      console.log(this.timeLeftSeconds);
      if (this.timeLeftSeconds <= 0) {
        this.endRoundTimer();
      }
    }, this.MS_PER_SEC);
  }

  private endRoundTimer() {
    clearInterval(this.clockTimeout);
    console.log('Guess over');
    this.startReply();
  }

  private startReply() {
    // SEND REPLY PHASE TO CLIENTS WITH ROLES (GUESS-GUESS / PASSIVE-PASSIVE)
    // SEND TIME TO CLIENT (10 SECONDS)
    this.currentGameState = CurrentGameState.REPLY;
    this.timeLeftSeconds = 10;
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
    this.startRoundTimer();
  }

  private startTimerGuessToClient() {
    const gameStartTime = new Date(Date.now() + this.timeLeftSeconds * this.MS_PER_SEC);
    this.io.in(this.lobbyId).emit(SocketLobby.SET_TIME, gameStartTime);
  }

  private startTimerReplyToClient() {
    const replyTimeSeconds = 10;
    const timerValue = new Date(Date.now() + replyTimeSeconds * this.MS_PER_SEC);
    this.io.in(this.lobbyId).emit(SocketLobby.SET_TIME, timerValue);
  }
}