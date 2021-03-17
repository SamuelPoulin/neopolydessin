import { injectable } from 'inversify';
import { Command } from '../../models/commands/command';
import { DrawCommand } from '../../models/commands/draw-command';
import { EraseCommand } from '../../models/commands/erase-command';
import { Coord, Path } from '../../models/commands/path';
import { BrushInfo } from '../../../common/communication/brush-info';
@injectable()
export class DrawingCommandsService {

  currentPath: Path | undefined;

  doneCommands: Command[];

  undoneCommands: Command[];

  constructor() {
    this.doneCommands = [];
    this.undoneCommands = [];
  }

  async startPath(startPoint: Coord, brush: BrushInfo): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.currentPath) {
        this.currentPath = new Path(startPoint, brush);
        resolve();
      } else {
        reject();
      }
    });
  }

  async updatePath(updatePoints: Coord): Promise<void> {
    return new Promise<void>((resolve, reject) => {

      if (this.currentPath) {
        this.currentPath.addCoord(updatePoints);
        resolve();
      } else {
        reject();
      }
    });
  }

  async endPath(endPoint: Coord): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.currentPath) {
        this.currentPath.addCoord(endPoint);
        this.do(new DrawCommand(this.currentPath));
        this.currentPath = undefined;
        resolve();
      } else {
        reject();
      }
    });
  }

  async startErase(startPoint: Coord): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.currentPath) {
        this.currentPath = new Path(startPoint);
        resolve();
      } else {
        reject();
      }
    });
  }

  async updateErase(updatePoints: Coord[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.currentPath) {
        this.currentPath.addCoords(updatePoints);
        resolve();
      } else {
        reject();
      }
    });
  }

  async endErase(endPoint: Coord): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.currentPath) {
        this.currentPath.addCoord(endPoint);
        this.do(new EraseCommand(this.currentPath));
        this.currentPath = undefined;
        resolve();
      } else {
        reject();
      }
    });
  }

  do(todo: Command): void {
    this.doneCommands.push(todo);
  }

  async undo(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const commandToUndo = this.doneCommands.pop();
      if (commandToUndo) {
        this.undoneCommands.push(commandToUndo);
        resolve();
      }
      else {
        reject();
      }
    });
  }

  async redo(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const commandToRedo = this.undoneCommands.pop();
      if (commandToRedo) {
        this.doneCommands.push(commandToRedo);
        resolve();
      } else {
        reject();
      }
    });
  }
}