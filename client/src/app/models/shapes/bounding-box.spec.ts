/* tslint:disable:no-string-literal */
/* tslint:disable:no-magic-numbers */
import { Coordinate } from 'src/app/utils/math/coordinate';
import { BoundingBox } from './bounding-box';
import { ControlPoint } from './control-point.enum';

describe('BoundingBox', () => {
  let box: BoundingBox;

  beforeEach(() => {
    box = new BoundingBox(new Coordinate());
  });

  it('can initialize bounding box', () => {
    expect(box.svgNode.children.length).toEqual(ControlPoint.count + 1);
    expect(box['controlPoints'].length).toEqual(ControlPoint.count);
  });

  it('can set correct dimensions and update control points', () => {
    box['controlPoints'].forEach((point) => {
      expect(point.svgNode.style.display).toEqual('none');
    });

    box.origin = new Coordinate(10, 10);
    box.end = new Coordinate(50, 60);

    expect(box.width).toEqual(40);
    expect(box.height).toEqual(50);
    expect(box['controlPoints'][ControlPoint.top].origin.x).toEqual(box['controlPoints'][ControlPoint.bottom].origin.x);
    expect(box['controlPoints'][ControlPoint.left].origin.y).toEqual(box['controlPoints'][ControlPoint.right].origin.y);
  });
});
