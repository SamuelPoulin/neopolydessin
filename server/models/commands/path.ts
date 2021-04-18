import { BrushInfo } from '../../../common/communication/brush-info';
import { Coord } from '../../../common/communication/drawing-sequence';

export const DEFAULT_BRUSH_INFO: BrushInfo = {
  color: '#000000',
  strokeWidth: 1,
};
export class Path {

  id: number;
  path: Coord[];
  brushInfo: BrushInfo | undefined;


  constructor(id: number, startPoint?: Coord, brushInfo?: BrushInfo) {
    this.id = id;
    this.path = [];
    this.brushInfo = brushInfo ? brushInfo : DEFAULT_BRUSH_INFO;
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