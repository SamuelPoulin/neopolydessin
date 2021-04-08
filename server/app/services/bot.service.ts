/* eslint-disable no-invalid-this */
import { Server } from 'socket.io';
import { BotPersonnality, BOT_NAMES } from '../utils/botinfo';
import { ChatMessage } from '../../../common/communication/chat-message';
import { DrawingSequence, Segment } from '../../../common/communication/drawing-sequence';
import { Difficulty, Entity, GuessResponse, PlayerRole } from '../../../common/communication/lobby';
import { SocketDrawing } from '../../../common/socketendpoints/socket-drawing';
import { SocketMessages } from '../../../common/socketendpoints/socket-messages';

const PERCENT_1: number = 0.01;
const PERCENT_20: number = 0.2;
const PERCENT_30: number = 0.3;
const PERCENT_50: number = 0.5;
const EASY_DELAY: number = 50;
const INTERMEDIATE_DELAY: number = 25;
const HARD_DELAY: number = 15;

export class BotService {

  currentBot: number;
  private readonly HINT_COOLDOWN: number = 30;
  private readonly SPEED_MODIFIER: number = -10;

  private readonly DIFFICULTY_MODIFIER: Map<Difficulty, number> = new Map([
    [Difficulty.EASY, EASY_DELAY],
    [Difficulty.INTERMEDIATE, INTERMEDIATE_DELAY],
    [Difficulty.HARD, HARD_DELAY]
  ]);

  private readonly AGGRESSIVE: BotPersonnality = {
    onStartDraw: () => {
      if (Math.random() < PERCENT_20) {
        this.sendBotMessage('Êtes-vous prêts?');
        this.currentDrawDelay = this.baseDrawDelay + this.SPEED_MODIFIER;
      }
    },

    onStartSegment: () => {
      if (Math.random() < PERCENT_1 && this.currentDrawDelay !== this.baseDrawDelay) {
        this.sendBotMessage('Bon, je vais me calmer');
        this.currentDrawDelay = this.baseDrawDelay;
      } else if (Math.random() < PERCENT_1 && this.currentDrawDelay === this.baseDrawDelay) {
        this.sendBotMessage('On va plus vite!!');
        this.currentDrawDelay = this.baseDrawDelay + this.SPEED_MODIFIER;
      }
    },

    onResetDrawing: () => {
      if (Math.random() < PERCENT_20) {
        this.sendBotMessage('Un autre');
      }
    },

    onPlayerCorrectGuess: () => {
      if (Math.random() < PERCENT_30) {
        this.sendBotMessage('Finalement! C\'était pas si difficile?');
      }
    },

    onPlayerCloseGuess: () => {
      if (Math.random() < PERCENT_50) {
        this.sendBotMessage('Wow! Comment vous faites pour être aussi médiocre?');
      }
    },

    onPlayerIncorrectGuess: () => {
      if (Math.random() < PERCENT_50) {
        this.sendBotMessage('Vous êtes pas très bon... Pourtant mon dessin est clair.');
      }
    },

    onPlayerRequestsHint: () => {
      this.sendBotMessage(`Un indice... pour vrai? ${this.hints[this.hintIndex]}`);
    }
  };

  private readonly GENTLEMEN: BotPersonnality = {
    onStartDraw: () => {
      if (Math.random() < PERCENT_20) {
        this.sendBotMessage('Attention mesdames et messieurs, la partie va commencer!');
        this.currentDrawDelay = this.baseDrawDelay + this.SPEED_MODIFIER;
      }
    },

    onStartSegment: () => {
      if (Math.random() < PERCENT_1 && this.currentDrawDelay !== this.baseDrawDelay) {
        this.sendBotMessage('Je vais ralentir un peu, je suis à bout de souffle.');
        this.currentDrawDelay = this.baseDrawDelay;
      } else if (Math.random() < PERCENT_1 && this.currentDrawDelay === this.baseDrawDelay) {
        this.sendBotMessage('Augmentons la vitesse du jeu!');
        this.currentDrawDelay = this.baseDrawDelay + this.SPEED_MODIFIER;
      }
    },

    onResetDrawing: () => {
      if (Math.random() < PERCENT_20) {
        this.sendBotMessage('Allons-y pour un autre si cela ne vous derange pas?');
      }
    },

    onPlayerCorrectGuess: () => {
      if (Math.random() < PERCENT_30) {
        this.sendBotMessage('Fabuleux! Il s\'agit d\'une observation astucieuse!');
      }
    },

    onPlayerCloseGuess: () => {
      if (Math.random() < PERCENT_50) {
        this.sendBotMessage('Dommage, vous étiez si proche de la bonne réponse...');
      }
    },

    onPlayerIncorrectGuess: () => {
      if (Math.random() < PERCENT_50) {
        this.sendBotMessage('Ce n\'est pas exactement ce qu\'on recherche, malheureusement.');
      }
    },

    onPlayerRequestsHint: () => {
      this.sendBotMessage(`Il me fait plaisir de vous donner un indice, nous sommes dans la même équipe! ${this.hints[this.hintIndex]}`);
    }
  };

  private botPersonnalities: BotPersonnality[] = [this.AGGRESSIVE, this.GENTLEMEN];

  private io: Server;
  private drawing: DrawingSequence;

  private hintAvailable: boolean;
  private hintIndex: number;
  private hints: string[];
  private currentSegmentIndex: number;
  private currentCoordIndex: number;

  private baseDrawDelay: number;
  private currentDrawDelay: number;
  private lobbyId: string;
  private pathTimer: NodeJS.Timeout;

  private bots: { botName: string; personnality: BotPersonnality }[] = [];

  constructor(io: Server, lobbyId: string, difficulty: Difficulty) {
    this.hintAvailable = true;
    this.currentBot = 0;
    this.io = io;
    this.lobbyId = lobbyId;
    this.baseDrawDelay = this.DIFFICULTY_MODIFIER.get(difficulty) as number;
    this.currentDrawDelay = this.baseDrawDelay;
  }

  draw(drawing: DrawingSequence, hints: string[]): void {
    this.drawing = drawing;
    this.hints = hints;
    this.hintIndex = 0;
    this.currentCoordIndex = -1;
    this.currentSegmentIndex = 0;
    this.bots[this.currentBot].personnality.onStartDraw();
    this.drawPath(this.drawing.stack[this.currentSegmentIndex], 0);
  }

  resetDrawing(): void {
    clearInterval(this.pathTimer);
    this.currentCoordIndex = -1;
    this.currentSegmentIndex = 0;
    this.hints = [];
    this.hintIndex = 0;
    this.bots[this.currentBot].personnality.onResetDrawing();
  }

  pause(): void {
    clearInterval(this.pathTimer);
  }

  resume(): void {
    this.drawPath(this.drawing.stack[this.currentSegmentIndex], this.currentCoordIndex + 1);
  }

  playerGuess(guessStatus: GuessResponse): void {
    switch (guessStatus) {
      case GuessResponse.CORRECT:
        this.playerCorrectGuess();
        break;
      case GuessResponse.CLOSE:
        this.playerCloseGuess();
        break;
      case GuessResponse.WRONG:
        this.playerIncorrectGuess();
        break;
    }
  }

  requestHint(): void {
    if (this.hintAvailable) {
      this.hintAvailable = false;
      this.bots[this.currentBot].personnality.onPlayerRequestsHint();
      setTimeout(() => this.hintAvailable = true, this.HINT_COOLDOWN);
      if (this.hintIndex < this.hints.length) {
        this.hintIndex++;
      }
    }
  }

  getBotPersonnality(): BotPersonnality {
    const index = Math.floor(Math.random() * this.botPersonnalities.length);
    return this.botPersonnalities[index];
  }

  getBot(teamNumber: number): Entity {
    const personnality = this.getBotPersonnality();
    const botName = this.getBotUsername();
    this.bots.push({ personnality, botName });
    return {
      username: botName,
      playerRole: PlayerRole.PASSIVE,
      teamNumber,
      isBot: true,
      isOwner: false
    };
  }

  private playerCorrectGuess(): void {
    this.bots[this.currentBot].personnality.onPlayerCorrectGuess();
  }

  private playerCloseGuess(): void {
    this.bots[this.currentBot].personnality.onPlayerCloseGuess();
  }

  private playerIncorrectGuess(): void {
    this.bots[this.currentBot].personnality.onPlayerIncorrectGuess();
  }

  private drawPath(segment: Segment, startAt: number): void {
    this.currentCoordIndex = -1;

    this.pathTimer = setInterval(() => {
      this.currentCoordIndex++;
      if (this.currentCoordIndex >= startAt) {
        const coord = this.drawing.stack[this.currentSegmentIndex].path[this.currentCoordIndex];
        if (this.currentCoordIndex === 0) {
          this.bots[this.currentBot].personnality.onStartSegment();
          this.io.in(this.lobbyId).emit(SocketDrawing.START_PATH_BC, this.currentCoordIndex, segment.zIndex, coord, segment.brushInfo);
        } else if (this.currentCoordIndex < segment.path.length - 1) {
          this.io.in(this.lobbyId).emit(SocketDrawing.UPDATE_PATH_BC, coord);
        } else {
          this.io.in(this.lobbyId).emit(SocketDrawing.END_PATH_BC, coord);
          clearInterval(this.pathTimer);
          this.currentSegmentIndex++;
          if (this.currentSegmentIndex < this.drawing.stack.length) {
            this.drawPath(this.drawing.stack[this.currentSegmentIndex], 0);
          } else {
            this.resetDrawing();
          }
        }
      };
    }, this.currentDrawDelay);
  }

  private getBotUsername(): string {
    const random = Math.floor(Math.random() * BOT_NAMES.length);
    return BOT_NAMES[random];
  }

  private sendBotMessage(content: string): void {
    const messageWithUsername: ChatMessage = {
      content,
      timestamp: Date.now(),
      senderUsername: this.bots[this.currentBot].botName
    };
    this.io.in(this.lobbyId).emit(SocketMessages.RECEIVE_MESSAGE, messageWithUsername);

  }
}
