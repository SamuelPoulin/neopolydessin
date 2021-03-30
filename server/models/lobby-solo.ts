import { injectable } from 'inversify';
import { Server, Socket } from 'socket.io';
import { PictureWordService } from '../app/services/picture-word.service';
import { DatabaseService } from '../app/services/database.service';
import { SocketIdService } from '../app/services/socket-id.service';
import { CurrentGameState, Difficulty, GameType, PlayerRole } from '../../common/communication/lobby';
import { SocketLobby } from '../../common/socketendpoints/socket-lobby';
import { Lobby } from './lobby';

@injectable()
export class LobbySolo extends Lobby {

  private readonly SOLO_TEAM_SIZE: number = 2;
  private guessLeft: number;
  private clockTimeout: NodeJS.Timeout;

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
    this.size = this.SOLO_TEAM_SIZE;
    this.gameType = GameType.SPRINT_SOLO;
    this.guessLeft = 3;
    this.privateLobby = true;
  }

  addPlayer(playerId: string, role: PlayerRole, socket: Socket) {
    this.addPlayerToTeam(playerId, role, socket, 0)
      .then(() => {
        this.bindLobbyEndPoints(socket);
      })
      .catch((err) => {
        console.error(`There was an error when adding ${playerId} : ${err}`);
      });
  }

  protected bindLobbyEndPoints(socket: Socket) {

    super.bindLobbyEndPoints(socket);

    socket.on(SocketLobby.PLAYER_GUESS, (word: string, callback: (guessResponse: boolean) => void) => {
      const guesserValues = this.findPlayerBySocket(socket);
      if (guesserValues?.playerRole === PlayerRole.GUESSER) {
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
            this.guessLeft = 3;
          }
          callback(false);
        }
      }
    });

    socket.on(SocketLobby.START_GAME_SERVER, () => {
      const senderAccountId = this.socketIdService.GetAccountIdOfSocketId(socket.id);
      if (senderAccountId === this.ownerAccountId) {
        this.players.forEach((player) => player.playerRole = PlayerRole.GUESSER);
        this.io.in(this.lobbyId).emit(SocketLobby.START_GAME_CLIENT, this.toLobbyInfo());
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

  private timeRunOut() {
    clearInterval(this.clockTimeout);
    console.log('game over');
    this.endGame();
  }

  private addTimeOnCorrectGuess() {
    const timeCorrectGuess = 30000;
    const endTime = new Date(Date.now() + this.timeLeftSeconds * this.MS_PER_SEC + timeCorrectGuess);
    this.io.in(this.lobbyId).emit(SocketLobby.SET_TIME, endTime);
  }

  private sendStartTimeToClient() {
    const gameStartTime = new Date(Date.now() + this.timeLeftSeconds * this.MS_PER_SEC);
    this.io.in(this.lobbyId).emit(SocketLobby.SET_TIME, gameStartTime);
  }
}