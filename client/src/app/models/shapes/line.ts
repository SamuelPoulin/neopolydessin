import { BaseShape } from 'src/app/models/shapes/base-shape';
import { Coordinate } from 'src/app/utils/math/coordinate';

export class Line extends BaseShape {
  private _startCoord: Coordinate;
  private _endCoord: Coordinate;

  get startCoord(): Coordinate {
    return this._startCoord;
  }

  set startCoord(c: Coordinate) {
    this._startCoord = c;
    this.svgNode.setAttribute('x1', this._startCoord.x.toString());
    this.svgNode.setAttribute('y1', this._startCoord.y.toString());
  }

  get endCoord(): Coordinate {
    return this._endCoord;
  }

  set endCoord(c: Coordinate) {
    this._endCoord = c;
    this.svgNode.setAttribute('x2', this._endCoord.x.toString());
    this.svgNode.setAttribute('y2', this._endCoord.y.toString());
  }

  get origin(): Coordinate {
    return Coordinate.minXYCoord(this.startCoord, this.endCoord);
  }

  set origin(c: Coordinate) {
    const delta = Coordinate.subtract(c, this.origin);
    this.startCoord = Coordinate.add(this.startCoord, delta);
    this.endCoord = Coordinate.add(this.endCoord, delta);
    this.applyTransform();
  }

  get width(): number {
    return Math.abs(this.endCoord.x - this.startCoord.x);
  }

  get height(): number {
    return Math.abs(this.endCoord.y - this.startCoord.y);
  }

  constructor(startCoord: Coordinate = new Coordinate(), endCoord: Coordinate = startCoord, id?: number) {
    super('line', id);
    this.startCoord = startCoord;
    this.endCoord = endCoord;
    this.applyTransform();
  }

  readShape(data: Line): void {
    super.readShape(data);
    this.startCoord = Coordinate.copy(data._startCoord);
    this.endCoord = Coordinate.copy(data._endCoord);
    this.applyTransform();
  }
}
