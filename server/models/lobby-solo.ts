import { injectable } from 'inversify';
import { Server, Socket } from 'socket.io';
import { PictureWordService } from '../app/services/picture-word.service';
import { DatabaseService } from '../app/services/database.service';
import { SocketIdService } from '../app/services/socket-id.service';
import { Difficulty, GameType, PlayerRole, ReasonEndGame } from '../../common/communication/lobby';
import { SocketLobby } from '../../common/socketendpoints/socket-lobby';
import { Lobby } from './lobby';

@injectable()
export class LobbySolo extends Lobby {

  private guessLeft: number;

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
    this.gameType = GameType.SPRINT_SOLO;
    this.size = this.GAME_SIZE_MAP.get(this.gameType) as number;
    this.guessLeft = 3;
    this.privateLobby = true;
    this.players.push(this.getBotInfo(0));
  }

  addPlayer(playerId: string, socket: Socket) {
    this.addPlayerToTeam(playerId, socket, 0)
      .then(() => {
        this.bindLobbyEndPoints(socket);
      })
      .catch((err) => {
        console.error(`There was an error when adding ${playerId} : ${err}`);
      });
  }

  protected startGame(): void {
    this.players.forEach((player) => player.playerRole = PlayerRole.GUESSER);
    this.io.in(this.lobbyId).emit(SocketLobby.UPDATE_ROLES, this.toLobbyInfo());
    this.startRoundTimer();
  }

  protected bindLobbyEndPoints(socket: Socket) {

    super.bindLobbyEndPoints(socket);

    socket.on(SocketLobby.PLAYER_GUESS, (word: string, callback: (guessResponse: boolean) => void) => {
      const guesserValues = this.findPlayerBySocket(socket);
      if (guesserValues?.playerRole === PlayerRole.GUESSER) {
        if (word === this.wordToGuess) {
          this.teamScores[0]++;
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
  }

  protected unbindLobbyEndPoints(socket: Socket) {
    super.unbindLobbyEndPoints(socket);
    socket.removeAllListeners(SocketLobby.PLAYER_GUESS);
  }

  protected startRoundTimer() {
    // CHOOSE WORD TO DRAW BY BOT
    // START DRAWING BY BOT
    this.drawingCommands.resetDrawing();
    this.sendStartTimeToClient();
    this.clockTimeout = setInterval(() => {
      --this.timeLeftSeconds;
      if (this.timeLeftSeconds <= 0) {
        this.timeRunOut();
      }
    }, this.MS_PER_SEC);
  }

  private timeRunOut() {
    clearInterval(this.clockTimeout);
    this.endGame(ReasonEndGame.TIME_RUN_OUT);
  }

  private addTimeOnCorrectGuess() {
    const timeCorrectGuess = 30000;
    const endTime = Date.now() + this.timeLeftSeconds * this.MS_PER_SEC + timeCorrectGuess;
    this.io.in(this.lobbyId).emit(SocketLobby.SET_TIME, endTime);
  }

  private sendStartTimeToClient() {
    const gameStartTime = Date.now() + this.timeLeftSeconds * this.MS_PER_SEC;
    this.io.in(this.lobbyId).emit(SocketLobby.SET_TIME, gameStartTime);
  }
}