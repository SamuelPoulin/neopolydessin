import { injectable } from 'inversify';
import { Command } from '../../models/commands/command';
import { Coord, Path } from '../../models/commands/Path';

@injectable()
export class DrawingCommands {

  currentPath: Path | undefined;

  doneCommands: Command[];

  undoneCommands: Command[];

  async startPath(startPoint: Coord): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.currentPath) {
        this.currentPath = new Path(startPoint);
        resolve();
      } else {
        reject();
      }
    });
  }

  async updatePath(updatePoints: Coord[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.currentPath) {
        this.currentPath.addCoords(updatePoints);
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
        resolve();
      }
      reject();
    });
  }

  async erase(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      console.error('Erase not implemented');
      reject();
    });
  }

  do(todo: Command): void {
    this.doneCommands.push(todo);
    todo.do();
  }

  async undo(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const commandToUndo = this.doneCommands.pop();
      if (commandToUndo) {
        commandToUndo.undo();
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
        commandToRedo.do();
        this.doneCommands.push(commandToRedo);
        resolve();
      } else {
        reject();
      }
    });
  }
}