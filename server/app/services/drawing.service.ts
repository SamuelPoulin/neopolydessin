import { injectable } from 'inversify';
import { Coord, Path } from '../../models/commands/path';
import { BrushInfo } from '../../../common/communication/brush-info';
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

  async startPath(startPoint: Coord, brush: BrushInfo): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.currentPath) {
        this.currentPath = new Path(this.genId(), startPoint, brush);
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

  async addPath(id: number, coords: Coord[], brushInfo: BrushInfo): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const existingPath = this.paths.find((path) => path.id === id);
      if (!existingPath && id >= 0 && id < this.id) {
        const toAdd = new Path(id, undefined, brushInfo);
        toAdd.addCoords(coords);
        this.paths.push(toAdd);
        resolve();
      }
      else {
        reject();
      }
    });
  }

}