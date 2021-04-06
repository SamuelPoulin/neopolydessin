/* eslint-disable no-invalid-this */
import { BotPersonnality, BOT_NAMES } from 'app/utils/botinfo';
import { Server } from 'socket.io';
import { ChatMessage } from '../../../common/communication/chat-message';
import { DrawingSequence, Segment } from '../../../common/communication/drawing-sequence';
import { Entity, PlayerRole } from '../../../common/communication/lobby';
import { SocketDrawing } from '../../../common/socketendpoints/socket-drawing';
import { SocketMessages } from '../../../common/socketendpoints/socket-messages';

const PERCENT_20: number = 0.2;
const PERCENT_30: number = 0.3;
const PERCENT_50: number = 0.5;

export class BotService {

  private readonly DEFAULT_DRAW_DELAY: number = 10;

  private readonly AGGRESSIVE: BotPersonnality = {
    onStartDraw: () => {
      if (Math.random() < PERCENT_20) {
        this.sendBotMessage('Êtes-vous prêts?');
        this.drawDelay = 5;
      }
    },

    onStartSegment: () => {
      if (Math.random() < PERCENT_20) {
        this.sendBotMessage('Bon, je vais me calmer');
        this.drawDelay = 10;
      } else if (Math.random() < PERCENT_20 && this.drawDelay === this.DEFAULT_DRAW_DELAY) {
        this.sendBotMessage('On va plus vite!!');
        this.drawDelay = 5;
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
    }
  };

  private io: Server;
  private drawing: DrawingSequence;
  private currentSegmentIndex: number;
  private currentCoordIndex: number;

  private drawDelay: number;
  private lobbyId: string;
  private pathTimer: NodeJS.Timeout;

  private botName: string;
  private personnality: BotPersonnality;

  constructor(io: Server, lobbyId: string) {
    this.io = io;
    this.lobbyId = lobbyId;
    this.drawDelay = this.DEFAULT_DRAW_DELAY;
  }

  draw(drawing: DrawingSequence): void {
    this.drawing = drawing;
    this.currentCoordIndex = -1;
    this.currentSegmentIndex = 0;
    this.personnality.onStartDraw();
    this.drawPath(this.drawing.stack[this.currentSegmentIndex], 0);
  }

  resetDrawing(): void {
    clearInterval(this.pathTimer);
    this.currentCoordIndex = -1;
    this.currentSegmentIndex = 0;
    this.personnality.onResetDrawing();
  }

  pause(): void {
    clearInterval(this.pathTimer);
  }

  resume(): void {
    this.drawPath(this.drawing.stack[this.currentSegmentIndex], this.currentCoordIndex + 1);
  }

  playerCorrectGuess(): void {
    this.personnality.onPlayerCorrectGuess();
  }

  playerCloseGuess(): void {
    this.personnality.onPlayerCloseGuess();
  }

  playerIncorrectGuess(): void {
    this.personnality.onPlayerIncorrectGuess();
  }

  getBot(teamNumber: number): Entity {
    this.personnality = this.AGGRESSIVE;
    this.botName = this.getBotUsername();
    return {
      username: this.botName,
      playerRole: PlayerRole.PASSIVE,
      teamNumber,
      isBot: true,
      isOwner: false
    };
  }

  private drawPath(segment: Segment, startAt: number): void {
    this.currentCoordIndex = -1;

    this.pathTimer = setInterval(() => {
      this.currentCoordIndex++;
      if (this.currentCoordIndex >= startAt) {
        const coord = this.drawing.stack[this.currentSegmentIndex].path[this.currentCoordIndex];
        if (this.currentCoordIndex === 0) {
          this.personnality.onStartSegment();
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
    }, this.drawDelay);
  }

  private getBotUsername(): string {
    const random = Math.floor(Math.random() * BOT_NAMES.length);
    return BOT_NAMES[random];
  }

  private sendBotMessage(content: string): void {
    const messageWithUsername: ChatMessage = {
      content,
      timestamp: Date.now(),
      senderUsername: this.botName
    };
    this.io.in(this.lobbyId).emit(SocketMessages.RECEIVE_MESSAGE, messageWithUsername);

  }
}
