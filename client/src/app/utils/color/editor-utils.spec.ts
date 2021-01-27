/* tslint:disable:no-magic-numbers */
import createSpyObj = jasmine.createSpyObj;
import { DrawingSurfaceComponent } from '@components/pages/editor/drawing-surface/drawing-surface.component';
import { BoundingBox } from '@models/shapes/bounding-box';
import { BrushPath } from '@models/shapes/brush-path';
import { CompositeLine } from '@models/shapes/composite-line';
import { CompositeParticle } from '@models/shapes/composite-particle';
import { Ellipse } from '@models/shapes/ellipse';
import { Line } from '@models/shapes/line';
import { Path } from '@models/shapes/path';
import { Polygon } from '@models/shapes/polygon';
import { Rectangle } from '@models/shapes/rectangle';
import { Color } from '@utils/color/color';
import { EditorUtils } from '@utils/color/editor-utils';
import { Coordinate } from '@utils/math/coordinate';

describe('EditorUtils', () => {
  it('can get color at a position in a canvas', () => {
    const context: CanvasRenderingContext2D = createSpyObj('canvasContext', { getImageData: { data: [100, 200, 255] } });
    const color = EditorUtils.colorAtPointInCanvas(context, new Coordinate());

    expect(color.r255).toEqual(100);
    expect(color.g255).toEqual(200);
    expect(color.b255).toEqual(255);
  });

  it('generates a canvas and calls colorAtPointInCanvas on colorAtPoint', (done) => {
    const context = {} as CanvasRenderingContext2D;
    const promise: Promise<CanvasRenderingContext2D> = new Promise<CanvasRenderingContext2D>((resolve) => {
      resolve(context);
    });
    spyOn(EditorUtils, 'viewToCanvas').and.returnValue(promise);
    spyOn(EditorUtils, 'colorAtPointInCanvas').and.returnValue(Color.BLUE);

    const view = {} as DrawingSurfaceComponent;
    EditorUtils.colorAtPoint(view, new Coordinate()).then((color) => {
      expect(color).toEqual(Color.BLUE);
      expect(EditorUtils.viewToCanvas).toHaveBeenCalledWith(view);
      expect(EditorUtils.colorAtPointInCanvas).toHaveBeenCalledWith(context, new Coordinate());
      done();
    });
  });

  it('can get colorAtPointFromUint8ClampedArray', () => {
    const coord = new Coordinate(5, 10);
    const width = 100;
    const data = [];
    data[4020] = 10;
    data[4021] = 20;
    data[4022] = 30;

    const res = EditorUtils.colorAtPointFromUint8ClampedArray(new Uint8ClampedArray(data), coord, width) as Color;
    expect(res.rgbString).toEqual(Color.rgb255(10, 20, 30).rgbString);

    expect(EditorUtils.colorAtPointFromUint8ClampedArray(undefined, coord, width)).not.toBeDefined();
  });

  it('can create shape from existing shape', () => {
    const types = [
      new BoundingBox(),
      new BrushPath(),
      new CompositeLine(),
      new CompositeParticle(),
      new Ellipse(),
      new Line(),
      new Path(),
      new Polygon(),
      new Rectangle(),
    ];
    types.forEach((type) => {
      expect(EditorUtils.createShape(type).constructor.name).toEqual(type.constructor.name);
    });
  });
});
