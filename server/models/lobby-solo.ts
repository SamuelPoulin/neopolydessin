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
  PlayerRole,
  ReasonEndGame
} from '../../common/communication/lobby';
import { SocketLobby } from '../../common/socketendpoints/socket-lobby';
import { levenshtein } from '../app/utils/levenshtein-distance';
import { DifficultyModifiers, Lobby } from './lobby';

@injectable()
export class LobbySolo extends Lobby {

  private guessTries: number;
  private addOnCorrectGuess: number;

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
    const diffMods = this.DIFFICULTY_MODIFIERS.get(difficulty) as DifficultyModifiers;
    this.guessTries = diffMods.guessTries;
    this.guessLeft = this.guessTries;
    this.addOnCorrectGuess = diffMods.timeAddedOnCorrectGuess;
    this.timeLeftSeconds = diffMods.soloCoopTime;
    this.teamScores = [0];
    this.drawingTeamNumber = 0;
    this.privateLobby = true;
    this.players.push(this.botService.getBot(0));
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
    this.players.forEach((player) => player.playerRole = player.isBot ? PlayerRole.DRAWER : PlayerRole.GUESSER);
    this.io.in(this.lobbyId).emit(SocketLobby.UPDATE_GAME_STATE, CurrentGameState.DRAWING);
    this.io.in(this.lobbyId).emit(SocketLobby.UPDATE_ROLES, this.toLobbyInfo());
    this.startRoundTimer();
  }

  protected bindLobbyEndPoints(socket: Socket) {

    super.bindLobbyEndPoints(socket);

    socket.on(SocketLobby.PLAYER_GUESS, async (word: string) => {
      const player = this.findPlayerBySocket(socket);
      if (player) {
        const distance = levenshtein(word, this.wordToGuess);
        let guessStatus: GuessResponse;
        switch (distance) {
          case 0:
            guessStatus = GuessResponse.CORRECT;
            this.teamScores[0]++;
            this.io.in(this.lobbyId)
              .emit(SocketLobby.UPDATE_TEAMS_SCORE, this.getTeamsScoreArray());
            this.addTimeOnCorrectGuess();
            break;

          case 1:
          case 2:
            guessStatus = GuessResponse.CLOSE;
            this.guessLeft--;
            break;

          default:
            guessStatus = GuessResponse.WRONG;
            this.guessLeft--;
            break;
        }
        const guessMessage: GuessMessage = {
          content: word,
          timestamp: Date.now(),
          guessStatus,
          senderUsername: player.username,
        };
        this.io.in(this.lobbyId).emit(SocketLobby.GUESS_BROADCAST, guessMessage);
        this.botService.playerGuess(guessStatus, this.guessTries, this.guessLeft);

        if (this.guessLeft === 0 || guessStatus === GuessResponse.CORRECT) {
          this.botService.resetDrawing();
          this.io.in(this.lobbyId).emit(SocketLobby.UPDATE_GAME_STATE, CurrentGameState.DRAWING);
          this.pictureWordService.getRandomWord(this.difficulty)
            .then((pictureWord) => {
              this.wordToGuess = pictureWord.word;
              this.botService.draw(pictureWord.sequence, pictureWord.hints);
            })
            .catch((err) => {
              this.endGame(ReasonEndGame.NO_WORDS_FOUND);
            });
          this.guessLeft = this.guessTries;
        }
      }
    });
  }

  protected startRoundTimer() {
    this.pictureWordService.getRandomWord(this.difficulty)
      .then((pictureWord) => {
        this.wordToGuess = pictureWord.word;
        this.sendStartTimeToClient();

        this.botService.draw(pictureWord.sequence, pictureWord.hints);

        this.clockTimeout = setInterval(() => {
          --this.timeLeftSeconds;
          if (this.timeLeftSeconds <= 0) {
            this.botService.resetDrawing();
            this.timeRunOut();
          }
        }, this.MS_PER_SEC);
      })
      .catch((err) => {
        this.endGame(ReasonEndGame.NO_WORDS_FOUND);
      });
  }

  private timeRunOut() {
    clearInterval(this.clockTimeout);
    this.endGame(ReasonEndGame.TIME_RUN_OUT);
  }

  private addTimeOnCorrectGuess() {
    this.timeLeftSeconds += this.addOnCorrectGuess;
    const endTime = Date.now() + this.timeLeftSeconds * this.MS_PER_SEC;
    this.io.in(this.lobbyId).emit(SocketLobby.SET_TIME, { serverTime: Date.now(), timestamp: endTime });
  }

  private sendStartTimeToClient() {
    const gameStartTime = Date.now() + this.timeLeftSeconds * this.MS_PER_SEC;
    this.io.in(this.lobbyId).emit(SocketLobby.SET_TIME, { serverTime: Date.now(), timestamp: gameStartTime });
  }
}