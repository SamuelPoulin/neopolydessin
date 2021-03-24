import { injectable } from 'inversify';
import { Server, Socket } from 'socket.io';
import { SocketMessages } from '../../common/socketendpoints/socket-messages';
import { DatabaseService } from '../app/services/database.service';
import { SocketIdService } from '../app/services/socket-id.service';
import { CurrentGameState, Difficulty, GameType, PlayerStatus, PlayerRole } from '../../common/communication/lobby';
import { Lobby } from './lobby';

@injectable()
export class LobbyCoop extends Lobby {

  private guessLeft: number;
  private clockTimeout: NodeJS.Timeout;

  constructor(
    socketIdService: SocketIdService,
    databaseService: DatabaseService,
    io: Server,
    accountId: string,
    difficulty: Difficulty,
    privateGame: boolean,
    lobbyName: string
  ) {
    super(socketIdService, databaseService, io, accountId, difficulty, privateGame, lobbyName);
    this.guessLeft = 5;
    this.gameType = GameType.SPRINT_COOP;
    this.timeLeftSeconds = 60;
  }

  async addPlayer(accountIdPlayer: string, status: PlayerStatus, socketPlayer: Socket) {
    if (!this.findPlayerById(accountIdPlayer) && this.lobbyHasRoom()) {
      this.bindLobbyCoopEndPoints(socketPlayer);
    }
    super.addPlayer(accountIdPlayer, status, socketPlayer);
  }

  bindLobbyCoopEndPoints(socket: Socket) {
    socket.on(SocketMessages.PLAYER_GUESS, (word: string, callback: (guessResponse: boolean) => void) => {
      const guesserValues = this.findPlayerBySocket(socket);
      if (guesserValues?.playerStatus === PlayerStatus.GUESSER) {
        if (word === this.wordToGuess) {
          this.teams[0].currentScore++;
          this.timeLeftSeconds += 30;
          this.addTimeOnCorrectGuess();
          // EMIT NEW TIME
          // SELECT NEW WORD
          // EMIT NEW DRAWING BY BOT
          callback(true);
        }
        else {
          this.guessLeft--;
          if (this.guessLeft === 0) {
            // SELECT NEW WORD
            // EMIT NEW DRAWING BY BOT
            this.guessLeft = 5;
          }
          callback(false);
        }
      }
    });

    socket.on(SocketMessages.START_GAME_SERVER, () => {
      const senderAccountId = this.socketIdService.GetAccountIdOfSocketId(socket.id);
      if (senderAccountId === this.ownerAccountId) {
        const roleArray: PlayerRole[] = [];
        this.players.forEach((player) => {
          roleArray.push({playerName: player.username, playerStatus: PlayerStatus.GUESSER});
        });
        this.io.in(this.lobbyId).emit(SocketMessages.START_GAME_CLIENT, roleArray);
        this.currentGameState = CurrentGameState.IN_GAME;
        this.startRoundTimer();
      }
    });
  }

  startRoundTimer() {
    // CHOOSE WORD TO DRAW BY BOT
    // START DRAWING BY BOT
    this.sendStartTimeToClient();
    this.clockTimeout = setInterval(() => {
      --this.timeLeftSeconds;
      console.log(this.timeLeftSeconds);
      if (this.timeLeftSeconds <= 0) {
        this.timeRunOut();
      }
    }, this.MS_PER_SEC);
  }

  timeRunOut() {
    clearInterval(this.clockTimeout);
    console.log('game over');
    this.endGame();
  }

  addTimeOnCorrectGuess() {
    const timeCorrectGuess = 30000;
    const endTime = new Date(Date.now() +  this.timeLeftSeconds * this.MS_PER_SEC + timeCorrectGuess);
    this.io.in(this.lobbyId).emit(SocketMessages.SET_TIME, endTime);
  }

  sendStartTimeToClient() {
    const gameStartTime = new Date(Date.now() +  this.timeLeftSeconds * this.MS_PER_SEC);
    this.io.in(this.lobbyId).emit(SocketMessages.SET_TIME, gameStartTime);
  }
}