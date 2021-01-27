import { Coordinate } from '@utils/math/coordinate';
import { MathUtils } from '@utils/math/math-utils';
import { BaseShape } from './base-shape';

export class Polygon extends BaseShape {
  static readonly MIN_POLY_EDGES: number = 3;
  static readonly MAX_POLY_EDGES: number = 12;
  // tslint:disable-next-line:no-magic-numbers
  static readonly ORIENTATION_ANGLE: number = (3 * Math.PI) / 2;
  private readonly points: Coordinate[];
  private _interiorAngle: number;
  private _nEdges: number;

  get interiorAngle(): number {
    return this._interiorAngle;
  }
  get nEdges(): number {
    return this._nEdges;
  }
  set nEdges(nEdges: number) {
    this._nEdges = nEdges ? MathUtils.fit(nEdges, Polygon.MIN_POLY_EDGES, Polygon.MAX_POLY_EDGES) : Polygon.MIN_POLY_EDGES;
    this._interiorAngle = (2 * Math.PI) / this.nEdges;
  }

  get height(): number {
    return this.points.length > 0 ? Coordinate.maxArrayXYCoord(this.points).y - this.relativeOrigin.y : 0;
  }

  get width(): number {
    return this.points.length > 0 ? Coordinate.maxArrayXYCoord(this.points).x - this.relativeOrigin.x : 0;
  }

  private get relativeOrigin(): Coordinate {
    return this.points.length > 0 ? Coordinate.minArrayXYCoord(this.points) : new Coordinate();
  }

  get origin(): Coordinate {
    return Coordinate.add(this.relativeOrigin, this.offset);
  }
  set origin(c: Coordinate) {
    this.offset = Coordinate.subtract(c, this.relativeOrigin);
    this.applyTransform();
  }

  constructor(origin: Coordinate = new Coordinate(), nEdges: number = Polygon.MIN_POLY_EDGES, id?: number) {
    super('polygon', id);
    this.points = new Array<Coordinate>();
    this.origin = origin;
    this.nEdges = nEdges;
    this.applyTransform();
  }

  static coordRelativeToInCircle(angle: number, dimensions: Coordinate): Coordinate {
    const minDimension = Math.min(dimensions.x, dimensions.y);
    const x = minDimension / 2 + (minDimension / 2) * Math.cos(angle);
    const y = minDimension / 2 + (minDimension / 2) * Math.sin(angle);
    return new Coordinate(x, y);
  }

  readShape(data: Polygon): void {
    super.readShape(data);
    this.nEdges = data._nEdges;
    this.points.length = 0;
    data.points.forEach((p) => {
      this.points.push(Coordinate.copy(p));
    });
    this.drawPoints();
    this.applyTransform();
  }

  updatePoints(dimensions: Coordinate, origin: Coordinate): void {
    const absDimensions = Coordinate.abs(dimensions);
    if (dimensions.x === 0 || dimensions.y === 0) {
      return;
    }
    this.applyPoints(absDimensions);

    const offsetRatio = Math.max(this.width / absDimensions.x, this.height / absDimensions.y);
    if (offsetRatio !== 1) {
      this.applyPoints(new Coordinate(absDimensions.x / offsetRatio, absDimensions.y / offsetRatio));
    }

    this.origin = origin;

    if (dimensions.y < 0) {
      this.origin = new Coordinate(this.origin.x, this.origin.y + absDimensions.y - this.height);
    }
    if (dimensions.x < 0) {
      this.origin = new Coordinate(this.origin.x + absDimensions.x - this.width, this.origin.y);
    }

    this.drawPoints();
  }

  private applyPoints(dimensions: Coordinate): void {
    let angle = Polygon.ORIENTATION_ANGLE;
    this.points.length = 0;
    for (let i = 0; i < this.nEdges; i++) {
      angle += this.interiorAngle;
      this.points.push(Polygon.coordRelativeToInCircle(angle, dimensions));
    }
  }

  private drawPoints(): void {
    let sPoints = '';
    this.points.forEach((c: Coordinate) => {
      sPoints += c.x.toString() + ',' + c.y.toString() + ' ';
    });
    this.svgNode.setAttribute('points', sPoints);
  }
}
