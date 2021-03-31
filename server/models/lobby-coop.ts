import { injectable } from 'inversify';
import { Server, Socket } from 'socket.io';
import { levenshtein } from '../app/utils/levenshtein-distance';
import { PictureWordService } from '../app/services/picture-word.service';
import { DatabaseService } from '../app/services/database.service';
import { SocketIdService } from '../app/services/socket-id.service';
import { Difficulty, GameType, PlayerRole, GuessResponse, GuessMessageCoop, ReasonEndGame } from '../../common/communication/lobby';
import { SocketLobby } from '../../common/socketendpoints/socket-lobby';
import { Lobby } from './lobby';

@injectable()
export class LobbyCoop extends Lobby {

  private readonly NB_GUESS: number = 5;
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
    this.gameType = GameType.SPRINT_COOP;
    this.size = this.GAME_SIZE_MAP.get(this.gameType) as number;
    this.guessLeft = this.NB_GUESS;
    this.timeLeftSeconds = 60;
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

  protected startGame(): void {
    this.players.forEach((player) => player.playerRole = PlayerRole.GUESSER);
    this.io.in(this.lobbyId).emit(SocketLobby.UPDATE_ROLES, this.toLobbyInfo());
    this.startRoundTimer();
  }

  protected bindLobbyEndPoints(socket: Socket) {
    socket.on(SocketLobby.PLAYER_GUESS, async (word: string) => {
      const guesserValues = this.findPlayerBySocket(socket);
      if (guesserValues?.playerRole === PlayerRole.GUESSER) {
        const distance = levenshtein(word, this.wordToGuess);
        let guessStat;
        switch (distance) {
          case 0: {
            guessStat = GuessResponse.CORRECT;
            this.teams[0].currentScore++;
            this.io.in(this.lobbyId).emit(SocketLobby.UPDATE_TEAMS_SCORE, this.getTeamsScoreArray());
            this.timeLeftSeconds += this.TIME_ADD_CORRECT_GUESS;
            this.addTimeOnCorrectGuess();
            break;
          }
          case 1:
          case 2: {
            guessStat = GuessResponse.CLOSE;
            this.guessLeft--;
            if (this.guessLeft === 0) {
              await this.pictureWordService.getRandomWord().then((wordStructure) => {
                this.wordToGuess = wordStructure.word;
              });
              this.guessLeft = this.NB_GUESS;
            }
            break;
          }
          default: {
            guessStat = GuessResponse.WRONG;
            this.guessLeft--;
            if (this.guessLeft === 0) {
              await this.pictureWordService.getRandomWord().then((wordStructure) => {
                this.wordToGuess = wordStructure.word;
              });
              this.guessLeft = this.NB_GUESS;
            }
            break;
          }
        }
        const player = this.findPlayerBySocket(socket);
        if (player) {
          const guessReturn: GuessMessageCoop = {
            content: word,
            timestamp: Date.now(),
            guessStatus: guessStat,
            nbGuessLeft: this.guessLeft,
            senderUsername: player.username
          };
          this.io.in(this.lobbyId).emit(SocketLobby.COOP_GUESS_BROADCAST, guessReturn);
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
    this.io.in(this.lobbyId).emit(SocketLobby.SET_TIME, { serverTime: Date.now(), timestamp: endTime });
  }

  private sendStartTimeToClient() {
    const gameStartTime = Date.now() + this.timeLeftSeconds * this.MS_PER_SEC;
    this.io.in(this.lobbyId).emit(SocketLobby.SET_TIME, { serverTime: Date.now(), timestamp: gameStartTime });
  }
}