import { injectable } from 'inversify';
import { Server, Socket } from 'socket.io';
import { levenshtein } from '../app/utils/levenshtein-distance';
import { PictureWordService } from '../app/services/picture-word.service';
import { DatabaseService } from '../app/services/database.service';
import { SocketIdService } from '../app/services/socket-id.service';
import {
  CurrentGameState,
  Difficulty,
  GameType,
  PlayerStatus,
  PlayerRole,
  GuessResponse,
  GuessMessageCoop
} from '../../common/communication/lobby';
import { SocketLobby } from '../../common/socketendpoints/socket-lobby';
import { Lobby } from './lobby';

@injectable()
export class LobbyCoop extends Lobby {

  private readonly NB_GUESS: number = 5;
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
    this.guessLeft = this.NB_GUESS;
    this.gameType = GameType.SPRINT_COOP;
    this.timeLeftSeconds = 60;
  }

  addPlayer(playerId: string, status: PlayerStatus, socket: Socket) {
    this.addPlayerToTeam(playerId, status, socket, 0)
      .then(() => {
        this.bindLobbyEndPoints(socket);
      })
      .catch((err) => {
        console.error(`There was an error when adding ${playerId} : ${err}`);
      });
  }

  protected bindLobbyEndPoints(socket: Socket) {
    socket.on(SocketLobby.PLAYER_GUESS, async (word: string) => {
      const guesserValues = this.findPlayerBySocket(socket);
      if (guesserValues?.playerStatus === PlayerStatus.GUESSER) {
        const distance = levenshtein(word, this.wordToGuess);
        let guessStat;
        switch (distance) {
          case 0: {
            guessStat = GuessResponse.CORRECT;
            this.teams[0].currentScore++;
            this.timeLeftSeconds += this.TIME_ADD_CORRECT_GUESS;
            this.addTimeOnCorrectGuess();
            break;
          }
          case 1:
          case 2: {
            guessStat = GuessResponse.CLOSE;
            this.guessLeft--;
            if (this.guessLeft === 0) {
              // SELECT NEW WORD
              console.log('Word to guess before await: ' + this.wordToGuess);
              await this.pictureWordService.getRandomWord().then((wordStructure) => {
                this.wordToGuess = wordStructure.word;
                console.log('Word to guess in await: ' + this.wordToGuess);
              });
              console.log('Word to guess after await: ' + this.wordToGuess);
              // EMIT NEW DRAWING BY BOT
              this.guessLeft = this.NB_GUESS;
            }
            break;
          }
          default: {
            guessStat = GuessResponse.WRONG;
            this.guessLeft--;
            if (this.guessLeft === 0) {
              // SELECT NEW WORD
              console.log('Word to guess before await: ' + this.wordToGuess);
              await this.pictureWordService.getRandomWord().then((wordStructure) => {
                this.wordToGuess = wordStructure.word;
                console.log('Word to guess in await: ' + this.wordToGuess);
              });
              console.log('Word to guess after await: ' + this.wordToGuess);
              // EMIT NEW DRAWING BY BOT
              this.guessLeft = this.NB_GUESS;
            }
            break;
          }
        }
        console.log('Before response');
        const player = this.findPlayerBySocket(socket);
        if (player) {
          const guessReturn: GuessMessageCoop = {
            content: word,
            timestamp: Date.now(),
            guessStatus: guessStat,
            nbGuessLeft: this.guessLeft,
            guesserName: player.username
          };
          this.io.in(this.lobbyId).emit(SocketLobby.COOP_GUESS_BROADCAST, guessReturn);
        }
      }
    });

    socket.on(SocketLobby.START_GAME_SERVER, () => {
      const senderAccountId = this.socketIdService.GetAccountIdOfSocketId(socket.id);
      if (senderAccountId === this.ownerAccountId) {
        const roleArray: PlayerRole[] = [];
        this.players.forEach((player) => {
          roleArray.push({ playerName: player.username, playerStatus: PlayerStatus.GUESSER });
        });
        this.io.in(this.lobbyId).emit(SocketLobby.START_GAME_CLIENT, roleArray);
        this.currentGameState = CurrentGameState.IN_GAME;
      }
    });

    socket.on(SocketLobby.LOADING_OVER, () => {
      const playerDoneLoading = this.findPlayerBySocket(socket);
      if (playerDoneLoading) {
        playerDoneLoading.finishedLoading = true;
      }
      if (this.players.every((player) => player.finishedLoading)) {
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