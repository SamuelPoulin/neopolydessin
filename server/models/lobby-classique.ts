import { injectable } from 'inversify';
import { Server, Socket } from 'socket.io';
import { SocketMessages } from '../../common/socketendpoints/socket-messages';
import { DatabaseService } from '../app/services/database.service';
import { SocketIdService } from '../app/services/socket-id.service';
import { CurrentGameState, Difficulty, GameType, Lobby, Player, PlayerStatus } from './lobby';


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

  addPlayer(accountIdPlayer: string, status: PlayerStatus, socketPlayer: Socket) {
    if (!this.findPlayerById(accountIdPlayer) && this.lobbyHasRoom()) {
      this.databaseService.getAccountById(accountIdPlayer).then((account) => {
        const playerName = account.documents.username;
        console.log(playerName);
        if (this.teams[1].playersInTeam.length <= this.teams[0].playersInTeam.length) {
          const player: Player = {
            accountId: accountIdPlayer,
            username: playerName,
            playerStatus: status,
            socket: socketPlayer,
            teamNumber: 0
          };
          this.players.push(player);
          this.teams[0].playersInTeam.push(player);
        }
        else {
          const player: Player = {
            accountId: accountIdPlayer,
            username: playerName,
            playerStatus: status,
            socket: socketPlayer,
            teamNumber: 1
          };
          this.players.push(player);
          this.teams[1].playersInTeam.push(player);
        }
        socketPlayer.join(this.lobbyId);
        this.bindLobbyEndPoints(socketPlayer);
        this.bindLobbyClassiqueEndPoints(socketPlayer);
      });
    }
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

  bindLobbyClassiqueEndPoints(socket: Socket) {
    socket.on(SocketMessages.PLAYER_GUESS, (word: string, callback: (guessResponse: boolean) => void) => {
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

    socket.on(SocketMessages.START_GAME_SERVER, () => {
      const senderAccountId = this.socketIdService.GetAccountIdOfSocketId(socket.id);
      if (senderAccountId === this.ownerAccountId) {
        this.io.in(this.lobbyId).emit(SocketMessages.START_GAME_CLIENT);
        this.currentGameState = CurrentGameState.IN_GAME;
        this.startRoundTimer();
      }
    });
  }

  startRoundTimer() {
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

  endRoundTimer() {
    clearInterval(this.clockTimeout);
    console.log('Guess over');
    this.startReply();
  }

  startReply() {
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

  endReplyTimer() {
    clearInterval(this.clockTimeout);
    console.log('Reply over');
    this.startRoundTimer();
  }

  startTimerGuessToClient() {
    const gameStartTime = new Date(Date.now() +  this.timeLeftSeconds * this.MS_PER_SEC);
    this.io.in(this.lobbyId).emit(SocketMessages.SET_TIME, gameStartTime);
  }

  startTimerReplyToClient() {
    const replyTimeSeconds = 10;
    const timerValue = new Date(Date.now() +  replyTimeSeconds * this.MS_PER_SEC);
    this.io.in(this.lobbyId).emit(SocketMessages.SET_TIME, timerValue);
  }
}