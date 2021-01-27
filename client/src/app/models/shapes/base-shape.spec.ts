/* tslint:disable:no-magic-numbers */
import { ContourType } from '@models/tool-properties/creator-tool-properties/contour-type.enum';
import { BaseShape } from 'src/app/models/shapes/base-shape';
import { Color } from 'src/app/utils/color/color';
import { Coordinate } from 'src/app/utils/math/coordinate';

describe('BaseShape', () => {
  class BaseShapeImpl extends BaseShape {
    private _origin: Coordinate = new Coordinate();
    get origin(): Coordinate {
      return this._origin;
    }
    set origin(c: Coordinate) {
      this._origin = c;
    }
    get height(): number {
      return 10;
    }
    get width(): number {
      return 10;
    }
  }
  let component: BaseShape;
  beforeEach(() => {
    component = new BaseShapeImpl('rect');
  });
  it('should update properties', () => {
    component.strokeWidth = 8;
    component.secondaryColor = Color.GREEN;
    component.primaryColor = Color.BLUE;
    component.updateProperties();
    const width = component.svgNode.style.strokeWidth as string;
    expect(parseInt(width, 10)).toEqual(component.strokeWidth);
    expect(component.svgNode.style.strokeOpacity).toEqual(component.secondaryColor.a.toString());
    expect(component.svgNode.style.stroke).toEqual(component.secondaryColor.rgbString);
    expect(component.svgNode.style.fillOpacity).toEqual(component.primaryColor.a.toString());
    expect(component.svgNode.style.fill).toEqual(component.primaryColor.rgbString);
  });

  it('can set center', () => {
    const center = new Coordinate(20, 20);
    component.center = center;
    expect(component.center).toEqual(center);
  });

  it('can get end', () => {
    const end = new Coordinate(10, 10);
    expect(component.end).toEqual(end);
  });

  it('can remove svgNode when converting to JSON', () => {
    const json = JSON.parse(JSON.stringify(component, BaseShape.jsonReplacer));
    expect(json.svgNode).toBeFalsy();
    expect(Object.entries(json).length).toEqual(Object.entries(component).length - 1);
  });

  it('can read shape', () => {
    component.offset = new Coordinate(5, 5);
    component.rotation = 15;
    component.thickness = 50;
    component.strokeWidth = 5;
    component.primaryColor = Color.RED;
    component.secondaryColor = Color.BLUE;
    component.contourType = ContourType.FILLED;
    component.updateProperties();

    const shape = new BaseShapeImpl('rect', component.id);
    shape.readShape(JSON.parse(JSON.stringify(component)));
    expect(Object.values(shape)).toEqual(Object.values(component));
  });
});
