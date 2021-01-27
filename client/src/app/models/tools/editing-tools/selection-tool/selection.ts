import { BaseShape } from '@models/shapes/base-shape';
import { BoundingBox } from '@models/shapes/bounding-box';
import { Rectangle } from '@models/shapes/rectangle';
import { Color } from '@utils/color/color';
import { Coordinate } from '@utils/math/coordinate';

export class Selection {
  private readonly SELECT_AREA_DASHARRAY: string = '5';

  readonly area: Rectangle;
  readonly shapes: BaseShape[];
  readonly previous: BaseShape[];
  boundingBox: BoundingBox;

  get isEmpty(): boolean {
    return this.shapes.length === 0;
  }

  constructor() {
    this.shapes = new Array<BaseShape>();
    this.previous = new Array<BaseShape>();
    this.boundingBox = new BoundingBox();

    this.area = new Rectangle();
    this.area.primaryColor = Color.TRANSPARENT;
    this.area.svgNode.style.pointerEvents = BaseShape.CSS_NONE;
    this.area.svgNode.style.strokeDasharray = this.SELECT_AREA_DASHARRAY;
    this.area.updateProperties();
  }

  private static detectOneWayCollision(shape: BaseShape, candidate: BaseShape): boolean {
    for(const point of shape.corners) {
      if(this.detectPointCollision(point, candidate)) {
        return true;
      }
    }
    return false;
  }

  static detectBoundingBoxCollision(area: Rectangle, shape: BaseShape): boolean {
    return Selection.detectOneWayCollision(area, shape) || Selection.detectOneWayCollision(shape, area);
  }

  static detectPointCollision(point: Coordinate, shape: BaseShape): boolean {
    const box = this.calculateBoundingBox(shape);
    const rotatedPoint = point.rotate(-shape.rotation, shape.center);
    return rotatedPoint.inBounds(box.end, box.origin);
  }

  static calculateBoundingBox(shape: BaseShape, multiple: boolean = false): Rectangle {
    const box = new Rectangle();
    if(multiple) {
      const origin = Coordinate.minArrayXYCoord(shape.corners);
      const end = Coordinate.maxArrayXYCoord(shape.corners);
      box.origin = origin;
      box.end = end;
    } else {
      const offset = new Coordinate(shape.strokeWidth / 2, shape.strokeWidth / 2);
      box.origin = Coordinate.subtract(shape.origin, offset);
      box.end = Coordinate.add(shape.end, offset);
      box.rotation = shape.rotation;
    }
    return box;
  }

  clear(): void {
    this.shapes.length = 0;
  }

  updateBoundingBox(): void {
    if(this.shapes.length < 1) {
      this.boundingBox.origin = new Coordinate();
      this.boundingBox.end = new Coordinate();
      return;
    }
    let shapeBox = new Rectangle();
    if(this.shapes.length === 1) {
      shapeBox = Selection.calculateBoundingBox(this.shapes[0]);
      this.boundingBox.readShape(shapeBox);
    } else if (this.shapes.length > 1) {
      shapeBox = Selection.calculateBoundingBox(this.shapes[0], true);
      this.boundingBox.readShape(shapeBox);
      this.shapes.forEach((shape) => {
        shapeBox = Selection.calculateBoundingBox(shape, true);
        this.boundingBox.start = Coordinate.minXYCoord(this.boundingBox.origin, shapeBox.origin);
        this.boundingBox.end = Coordinate.maxXYCoord(this.boundingBox.end, shapeBox.end);
      });
    }
  }

  reverse(shape: BaseShape, array: BaseShape[] = this.shapes): void {
    array.indexOf(shape) === -1 ? this.addSelectedShape(shape) : this.removeSelectedShape(shape);
  }

  addSelectedShape(shape: BaseShape): void {
    const index = this.shapes.indexOf(shape);
    if (index === -1) {
      this.shapes.push(shape);
    }
  }

  private removeSelectedShape(shape: BaseShape): void {
    const index = this.shapes.indexOf(shape);
    if (index !== -1) {
      this.shapes.splice(index, 1);
    }
  }

  resizeArea(origin: Coordinate = new Coordinate(), end: Coordinate = origin): void {
    this.area.origin = origin;
    this.area.end = end;
  }
}
