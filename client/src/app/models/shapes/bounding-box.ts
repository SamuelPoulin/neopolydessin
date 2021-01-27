import { Color } from 'src/app/utils/color/color';
import { Coordinate } from 'src/app/utils/math/coordinate';
import { BaseShape } from './base-shape';
import { ControlPoint } from './control-point.enum';
import { Rectangle } from './rectangle';

export class BoundingBox extends BaseShape {
  // tslint:disable-next-line:no-magic-numbers
  static readonly BOUNDING_BOX_COLOR: Color = Color.rgb255(80, 80, 255, 0.25);

  private outline: Rectangle;
  private controlPoints: Rectangle[];

  get origin(): Coordinate {
    return this.outline.origin;
  }

  set origin(c: Coordinate) {
    this.outline.origin = c;
    this.updateControlPoints();
    this.applyTransform();
  }

  get width(): number {
    return this.outline.width;
  }

  get height(): number {
    return this.outline.height;
  }

  set start(c: Coordinate) {
    this.outline.start = c;
    this.updateControlPoints();
  }

  get end(): Coordinate {
    return this.outline.end;
  }

  set end(c: Coordinate) {
    this.outline.end = c;
    this.updateControlPoints();
  }

  constructor(c: Coordinate = new Coordinate(), id?: number) {
    super('g', id);
    this.outline = new Rectangle(c);
    this.outline.svgNode.style.pointerEvents = BaseShape.CSS_NONE;
    this.outline.primaryColor = BoundingBox.BOUNDING_BOX_COLOR;
    this.outline.secondaryColor = BoundingBox.BOUNDING_BOX_COLOR;
    this.outline.updateProperties();
    this.svgNode.appendChild(this.outline.svgNode);

    this.initControlPoints();
  }

  readShape(data: BaseShape): void {
    this.origin = Coordinate.copy(data.origin);
    this.end = Coordinate.copy(data.end);
    this.rotation = data.rotation;
  }

  private initControlPoints(): void {
    this.controlPoints = new Array<Rectangle>();
    for (let i = 0; i < ControlPoint.count; i++) {
      const controlPoint = new Rectangle(new Coordinate(), ControlPoint.size);
      this.controlPoints.push(controlPoint);
      this.svgNode.appendChild(controlPoint.svgNode);
    }

    this.updateControlPoints();
  }

  private updateControlPoints(): void {
    this.outline.width === 0 && this.outline.height === 0 ? this.hideControlPoints() : this.displayControlPoints();
  }

  private displayControlPoints(): void {
    this.controlPoints.forEach((point) => {
      point.svgNode.style.display = '';
    });
    this.controlPoints[ControlPoint.top].center = new Coordinate(this.outline.center.x, this.outline.origin.y);
    this.controlPoints[ControlPoint.right].center = new Coordinate(this.outline.end.x, this.outline.center.y);
    this.controlPoints[ControlPoint.bottom].center = new Coordinate(this.outline.center.x, this.outline.end.y);
    this.controlPoints[ControlPoint.left].center = new Coordinate(this.outline.origin.x, this.outline.center.y);
  }

  private hideControlPoints(): void {
    this.controlPoints.forEach((point) => {
      point.svgNode.style.display = BaseShape.CSS_NONE;
    });
  }
}
