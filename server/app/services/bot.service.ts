import { Server } from 'socket.io';
import { DrawingSequence, Segment } from '../../../common/communication/drawing-sequence';
import { SocketDrawing } from '../../../common/socketendpoints/socket-drawing';


export class BotService {

  readonly DRAW_SPEED: number = 25;

  private io: Server;
  private drawing: DrawingSequence;
  private currentSegmentIndex: number;
  private currentCoordIndex: number;

  private lobbyId: string;
  private pathTimer: NodeJS.Timeout;

  constructor(io: Server, lobbyId: string) {
    this.io = io;
    this.lobbyId = lobbyId;
  }

  draw(drawing: DrawingSequence): void {
    this.drawing = drawing;
    this.currentSegmentIndex = 0;
    this.currentCoordIndex = 0;
    this.drawPath(this.drawing.stack[this.currentSegmentIndex], 0);
  }

  resetDrawing(): void {
    clearInterval(this.pathTimer);
    this.currentCoordIndex = 0;
    this.currentSegmentIndex = 0;
  }

  pause(): void {
    clearInterval(this.pathTimer);
  }

  resume(): void {
    this.drawPath(this.drawing.stack[this.currentSegmentIndex], this.currentCoordIndex + 1);
  }

  private drawPath(segment: Segment, startAt: number): void {
    this.currentCoordIndex = -1;

    this.pathTimer = setInterval(() => {
      this.currentCoordIndex++;
      if (this.currentCoordIndex >= startAt) {
        const coord = this.drawing.stack[this.currentSegmentIndex].path[this.currentCoordIndex];
        if (this.currentCoordIndex === 0) {
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
    }, this.DRAW_SPEED);
  }
}
