import { ContourType } from '@tool-properties/creator-tool-properties/contour-type.enum';
import { MathUtils } from '@utils/math/math-utils';
import { Color } from 'src/app/utils/color/color';
import { Coordinate } from 'src/app/utils/math/coordinate';

export abstract class BaseShape {
  // tslint:disable-next-line:typedef
  private static SHAPE_ID = 0;
  static readonly CSS_NONE: string = 'none';
  static readonly SVG_NAMESPACE_URL: string = 'http://www.w3.org/2000/svg';
  static readonly TYPE_ATTRIBUTE: string = 'shape-type';
  readonly svgNode: SVGElement;
  readonly id: number;
  readonly type: string;
  private _offset: Coordinate;
  private _rotation: number;

  thickness: number;
  strokeWidth: number;
  secondaryColor: Color;
  primaryColor: Color;
  contourType: ContourType;

  abstract get origin(): Coordinate;
  abstract set origin(c: Coordinate);

  abstract get width(): number;
  abstract get height(): number;

  get offset(): Coordinate {
    return this._offset;
  }

  set offset(c: Coordinate) {
    this._offset = c;
    this.applyTransform();
  }

  get rotation(): number {
    return this._rotation;
  }

  set rotation(angle: number) {
    this._rotation = angle;
    this.applyTransform();
  }

  get center(): Coordinate {
    return new Coordinate(this.origin.x + this.width / 2, this.origin.y + this.height / 2);
  }

  set center(c: Coordinate) {
    this.origin = new Coordinate(c.x - this.width / 2, c.y - this.height / 2);
    this.applyTransform();
  }

  get end(): Coordinate {
    return Coordinate.add(this.origin, new Coordinate(this.width, this.height));
  }

  get corners(): Coordinate[] {
    const s = this.strokeWidth / 2;
    const corners: Coordinate[] = [
      Coordinate.add(this.origin, new Coordinate(-s, -s)),
      Coordinate.add(new Coordinate(this.end.x, this.origin.y), new Coordinate(s, -s)),
      Coordinate.add(this.end, new Coordinate(s, s)),
      Coordinate.add(new Coordinate(this.origin.x, this.end.y), new Coordinate(-s, s))
    ];
    corners.forEach((corner, index) => {
      corners[index] = corner.rotate(this.rotation, this.center);
    });
    return corners;
  }

  constructor(svgType: string, id?: number) {
    this.svgNode = document.createElementNS(BaseShape.SVG_NAMESPACE_URL, svgType) as SVGElement;
    this.svgNode.setAttribute(BaseShape.TYPE_ATTRIBUTE, this.constructor.name);
    this.type = this.constructor.name;
    this.id = id ? id : BaseShape.SHAPE_ID++;
    this.svgNode.id = `shape-${svgType}-${this.id}`;

    this._offset = new Coordinate();
    this._rotation = 0;
    this.thickness = 1;
    this.strokeWidth = 1;
    this.secondaryColor = Color.BLACK;
    this.primaryColor = Color.WHITE;
    this.contourType = ContourType.FILLED_CONTOUR;

    this.updateProperties();
  }

  // tslint:disable-next-line:no-any
  static jsonReplacer(key: string, value: any): any {
    // for use with JSON.Stringify
    return key === 'svgNode' ? undefined : value;
  }

  readShape(data: BaseShape): void {
    this.offset = Coordinate.copy(data._offset);
    this.rotation = data._rotation;

    this.thickness = data.thickness;
    this.strokeWidth = data.strokeWidth;
    this.primaryColor = Color.copy(data.primaryColor);
    this.secondaryColor = Color.copy(data.secondaryColor);
    this.contourType = data.contourType;

    this.updateProperties();
  }

  protected applyTransform(): void {
    const angle = -MathUtils.toRad(this.rotation);
    const offsetX = Math.cos(angle) * this.offset.x + Math.sin(angle) * this.offset.y;
    const offsetY = Math.cos(angle) * this.offset.y - Math.sin(angle) * this.offset.x;
    let transformStr = `translate(${offsetX},${offsetY})`;
    if (this.center && this.rotation) {
      transformStr += `,rotate(${this.rotation},${this.center.x},${this.center.y})`;
    }
    this.svgNode.setAttribute('transform', transformStr);
  }

  updateProperties(): void {
    const hasStroke = this.contourType !== ContourType.FILLED;
    const hasFill = this.contourType !== ContourType.CONTOUR;

    this.svgNode.style.strokeWidth = this.strokeWidth.toString();
    this.svgNode.style.strokeOpacity = this.secondaryColor.a.toString();
    this.svgNode.style.fillOpacity = this.primaryColor.a.toString();

    this.svgNode.style.stroke = hasStroke ? this.secondaryColor.rgbString : BaseShape.CSS_NONE;
    this.svgNode.style.fill = hasFill ? this.primaryColor.rgbString : BaseShape.CSS_NONE;
  }

  highlight(color: Color, thickness: number): void {
    const highlightNode = (node: SVGElement) => {
      const { strokeWidth } = node.style;
      if (!strokeWidth || +strokeWidth < thickness) {
        node.style.strokeWidth = thickness.toString();
      }

      node.style.stroke = color.rgbString;
      node.style.strokeOpacity = '1';
      node.childNodes.forEach(highlightNode);
    };

    highlightNode(this.svgNode);
  }
}
