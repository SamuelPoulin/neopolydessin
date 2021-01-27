import { BaseShape } from 'src/app/models/shapes/base-shape';
import { Coordinate } from 'src/app/utils/math/coordinate';

export class Rectangle extends BaseShape {
  private _origin: Coordinate;
  private _height: number;
  private _width: number;

  get height(): number {
    return this._height;
  }

  set height(height: number) {
    this._height = !height ? 0 : Math.abs(height);
    this.svgNode.setAttribute('height', this.height.toString());
  }

  get width(): number {
    return this._width;
  }

  set width(width: number) {
    this._width = !width ? 0 : Math.abs(width);
    this.svgNode.setAttribute('width', this.width.toString());
  }

  get origin(): Coordinate {
    return this._origin;
  }

  set origin(c: Coordinate) {
    this._origin = c;
    this.svgNode.setAttribute('x', this._origin.x.toString());
    this.svgNode.setAttribute('y', this._origin.y.toString());
    this.applyTransform();
  }

  set start(c: Coordinate) {
    const end = Coordinate.copy(this.end);
    this.origin = c;
    this.end = end;
  }

  get end(): Coordinate {
    return super.end;
  }

  set end(c: Coordinate) {
    const end = Coordinate.maxXYCoord(c, this.origin);
    this.origin = Coordinate.minXYCoord(c, this.origin);
    this.width = end.x - this.origin.x;
    this.height = end.y - this.origin.y;
  }

  constructor(origin: Coordinate = new Coordinate(), width: number = 0, height: number = width, id?: number) {
    super('rect', id);
    this.origin = origin;
    this.width = width;
    this.height = height;
    this.applyTransform();
  }

  readShape(data: Rectangle): void {
    super.readShape(data);
    this.origin = Coordinate.copy(data._origin);
    this.width = data._width;
    this.height = data._height;
    this.applyTransform();
  }
}
