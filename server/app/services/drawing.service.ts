import { injectable } from 'inversify';
import { Path } from '../../models/commands/path';
import { BrushInfo } from '../../../common/communication/brush-info';
import { Coord } from '../../../common/communication/drawing-sequence';
@injectable()
export class DrawingService {

  currentPath: Path | undefined;

  paths: Path[];

  erasedPaths: Path[];

  id: number;

  constructor() {
    this.id = 0;
    this.paths = [];
    this.erasedPaths = [];
  }

  genId(): number {
    return this.id++;
  }

  resetDrawing(): void {
    this.currentPath = undefined;
    this.paths = [];
    this.erasedPaths = [];
    this.id = 0;
  }

  async startPath(startPoint: Coord, brush: BrushInfo): Promise<Path> {
    return new Promise<Path>((resolve, reject) => {
      if (!this.currentPath) {
        this.currentPath = new Path(this.genId(), startPoint, brush);
        resolve(this.currentPath);
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
        this.paths.push(this.currentPath);
        this.currentPath = undefined;
        resolve();
      } else {
        reject();
      }
    });
  }

  async erase(id: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const toEraseIndex = this.paths.findIndex((path) => path.id === id);
      if (toEraseIndex !== -1) {
        this.erasedPaths.push(this.paths[toEraseIndex]);
        this.paths.splice(toEraseIndex, 1);
        resolve();
      } else {
        reject();
      }
    });
  }

  async addPath(id: number): Promise<Path> {
    return new Promise<Path>((resolve, reject) => {
      const existingPath = this.erasedPaths.find((path) => path.id === id);
      if (existingPath) {
        this.paths.push(existingPath);
        resolve(existingPath);
      }
      else {
        reject();
      }
    });
  }

}