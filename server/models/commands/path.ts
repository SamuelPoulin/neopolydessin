import { BrushInfo } from '../../../common/communication/brush-info';

export interface Coord {
  x: number;
  y: number;
}

export class Path {

  path: Coord[];
  brushInfo: BrushInfo | undefined;

  constructor(startPoint?: Coord, brushInfo?: BrushInfo) {
    this.path = [];
    this.brushInfo = brushInfo;
    if (startPoint) {
      this.path.push(startPoint);
    }
  }

  addCoord(point: Coord) {
    if (!this.path.find((coord) => { return coord.x === point.x && coord.y === point.y; })) {
      this.path.push(point);
    }
  }

  addCoords(points: Coord[]) {
    points.forEach((point) => {
      this.addCoord(point);
    });
  }

}