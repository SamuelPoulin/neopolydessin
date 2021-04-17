import { Server } from 'socket.io';
import { BotPersonnality } from '../utils/botinfo';
import { DrawingSequence, Segment } from '../../../common/communication/drawing-sequence';
import { Difficulty, Entity, GuessResponse, PlayerRole } from '../../../common/communication/lobby';
import { SocketDrawing } from '../../../common/socketendpoints/socket-drawing';

const HINT_COOLDOWN: number = 30000;
export class BotService {

  currentBot: number;

  private drawing: DrawingSequence;

  private hintAvailable: boolean;
  private currentSegmentIndex: number;
  private currentCoordIndex: number;

  private pathTimer: NodeJS.Timeout;

  private bots: BotPersonnality[] = [];

  constructor(
    private io: Server,
    private lobbyId: string,
    private difficulty: Difficulty
  ) {
    this.hintAvailable = true;
    this.currentBot = 0;
    this.lobbyId = lobbyId;
  }

  draw(drawing: DrawingSequence, hints: string[]): void {
    clearInterval(this.pathTimer);
    this.drawing = drawing;
    this.currentCoordIndex = -1;
    this.currentSegmentIndex = 0;
    this.bots[this.currentBot].hintIndex = 0;
    this.bots[this.currentBot].hints = hints;
    this.bots[this.currentBot].onStartDraw();
    this.drawPath(this.drawing.stack[this.currentSegmentIndex], 0);
  }

  resetDrawing(): void {
    this.resetDrawingWithoutBotQuote();
    this.bots[this.currentBot].onResetDrawing();
  }

  resetDrawingWithoutBotQuote(): void {
    clearInterval(this.pathTimer);
    this.currentCoordIndex = -1;
    this.currentSegmentIndex = 0;
    this.bots[this.currentBot].hints.length = 0;
    this.bots[this.currentBot].hintIndex = 0;
  }

  pause(): void {
    clearInterval(this.pathTimer);
  }

  resume(): void {
    this.drawPath(this.drawing.stack[this.currentSegmentIndex], this.currentCoordIndex + 1);
  }

  playerGuess(guessStatus: GuessResponse, guessTries?: number, guessLeft?: number): void {
    if (this.currentBot < this.bots.length) {
      switch (guessStatus) {
        case GuessResponse.CORRECT:
          this.bots[this.currentBot].onPlayerCorrectGuess(guessTries, guessLeft);
          break;
        case GuessResponse.CLOSE:
          this.bots[this.currentBot].onPlayerCloseGuess(guessTries, guessLeft);
          break;
        case GuessResponse.WRONG:
          this.bots[this.currentBot].onPlayerIncorrectGuess(guessTries, guessLeft);
          break;
      }
    }
  }

  requestHint(): void {
    if (this.hintAvailable && this.currentBot < this.bots.length) {
      this.hintAvailable = false;
      this.bots[this.currentBot].onPlayerRequestsHint();
      setTimeout(() => this.hintAvailable = true, HINT_COOLDOWN);
    }
  }

  getBot(teamNumber: number): Entity {
    const bot = new BotPersonnality(this.io, this.lobbyId, this.difficulty);
    this.bots.push(bot);
    return {
      username: bot.name,
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
          this.bots[this.currentBot].onStartSegment();
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
            this.resetDrawingWithoutBotQuote();
          }
        }
      };
    }, this.bots[this.currentBot].drawDelay);
  }

}