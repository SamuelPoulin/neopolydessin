import { BaseShape } from 'src/app/models/shapes/base-shape';
import { Ellipse } from 'src/app/models/shapes/ellipse';
import { Line } from 'src/app/models/shapes/line';
import { Coordinate } from 'src/app/utils/math/coordinate';

export class CompositeLine extends BaseShape {
  static readonly MAX_FINAL_SNAP_DISTANCE: number = 3;

  lineArray: Line[];
  junctionArray: Ellipse[];

  get currentLine(): Line {
    return this.lineArray[this.lineArray.length - 1];
  }
  get currentJunction(): Ellipse {
    return this.junctionArray[this.junctionArray.length - 1];
  }

  get origin(): Coordinate {
    return this.junctionArray.length > 0 ? Coordinate.minArrayXYCoord(this.junctionArray.map((shape) => shape.origin)) : new Coordinate();
  }

  set origin(c: Coordinate) {
    const delta = Coordinate.subtract(c, this.origin);
    const shapes: BaseShape[] = this.lineArray as BaseShape[];
    shapes.concat(this.junctionArray as BaseShape[]).forEach((shape) => {
      shape.origin = Coordinate.add(shape.origin, delta);
    });
    this.applyTransform();
  }

  get width(): number {
    return this.junctionArray.length > 0 ? Coordinate.maxArrayXYCoord(this.junctionArray.map((shape) => shape.end)).x - this.origin.x : 0;
  }

  get height(): number {
    return this.junctionArray.length > 0 ? Coordinate.maxArrayXYCoord(this.junctionArray.map((shape) => shape.end)).y - this.origin.y : 0;
  }

  constructor(initCoord?: Coordinate, id?: number) {
    super('g', id);

    this.lineArray = [];
    this.junctionArray = [];

    if (initCoord) {
      this.addPoint(initCoord);
    }
    this.applyTransform();
  }

  readShape(data: CompositeLine): void {
    super.readShape(data);
    this.lineArray.length = 0;
    this.junctionArray.length = 0;
    data.lineArray.forEach((l) => {
      const line = new Line(undefined, undefined, l.id);
      line.readShape(l);
      this.lineArray.push(line);
      this.svgNode.appendChild(line.svgNode);
    });
    data.junctionArray.forEach((j) => {
      const junction = new Ellipse(undefined, undefined, undefined, j.id);
      junction.readShape(j);
      this.junctionArray.push(junction);
      this.svgNode.appendChild(junction.svgNode);
    });
    this.updateProperties();
    this.applyTransform();
  }

  updateProperties(): void {
    if (this.lineArray) {
      this.lineArray.forEach((line) => {
        line.secondaryColor = this.primaryColor;
        line.strokeWidth = this.strokeWidth;
        line.updateProperties();
      });
    }
    if (this.junctionArray) {
      this.junctionArray.forEach((junction) => {
        const center: Coordinate = Coordinate.copy(junction.center);
        junction.primaryColor = this.secondaryColor;
        junction.strokeWidth = 0;
        junction.radiusX = this.thickness;
        junction.radiusY = this.thickness;
        junction.center = center;
        junction.updateProperties();
      });
    }
  }

  addPoint(c: Coordinate): void {
    this.addLine(c);
    this.addJunction(c);
    this.updateProperties();
  }

  confirmPoint(): void {
    this.addPoint(this.currentLine.endCoord);
  }

  removeLastPoint(): boolean {
    if (this.lineArray.length > 1) {
      const lastLine = this.lineArray.pop();
      const lastJunction = this.junctionArray.pop();

      if (lastLine && lastJunction) {
        this.lineArray[this.lineArray.length - 1].endCoord = lastLine.endCoord;
        this.svgNode.removeChild(lastLine.svgNode);
        this.svgNode.removeChild(lastJunction.svgNode);
        return true;
      }
    }
    return false;
  }

  endLine(c: Coordinate): void {
    this.removeLastPoint();
    this.removeLastPoint();

    const shouldClose = Coordinate.maxXYDistance(c, this.lineArray[0].startCoord) < CompositeLine.MAX_FINAL_SNAP_DISTANCE;
    if (shouldClose) {
      this.updateCurrentCoord(this.lineArray[0].startCoord);
    } else {
      this.addJunction(this.currentLine.endCoord);
      this.updateProperties();
    }
  }

  updateCurrentCoord(c: Coordinate): void {
    this.currentLine.endCoord = c;
  }

  addLine(c: Coordinate): void {
    const line = new Line(c);
    this.lineArray.push(line);
    this.svgNode.appendChild(line.svgNode);
  }

  addJunction(c: Coordinate): void {
    const junction = new Ellipse(c);
    this.junctionArray.push(junction);
    this.svgNode.appendChild(junction.svgNode);
  }
}
