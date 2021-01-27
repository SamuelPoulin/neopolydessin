/* tslint:disable:no-magic-numbers */
import { EditorUtils } from '@utils/color/editor-utils';
import { Path } from 'src/app/models/shapes/path';
import { Coordinate } from 'src/app/utils/math/coordinate';

describe('Path', () => {
  let path: Path;
  const coord = new Array<Coordinate>();
  coord[0] = new Coordinate(0, 0);
  coord[1] = new Coordinate(2, 2);
  coord[2] = new Coordinate(17, 8);
  coord[3] = new Coordinate(3, 4);
  beforeEach(() => {
    path = new Path(new Coordinate());
  });
  it('Can read shape', () => {
    for (const c of coord) {
      path.addPoint(c);
    }
    const path2 = EditorUtils.createShape(JSON.parse(JSON.stringify(path)));
    expect(Object.values(path2)).toEqual(Object.values(path));
  });
  it('Should set trace to given node', () => {
    path.trace = 'M ' + 12 + ' ' + 13 + ' L' + ' ' + 2 + ' ' + 4;
    expect(path.trace).toEqual('M 12 13 L 2 4');
    expect(path.svgNode.getAttribute('d')).toEqual('M 12 13 L 2 4');
  });
  it('Should set origin to given coordinate', () => {
    path.origin = coord[1];
    expect(path.origin.x).toEqual(2);
    expect(path.origin.y).toEqual(2);
  });
  it('Should add the point to trace', () => {
    path.trace = 'M ' + 1 + ' ' + 2;
    path.addPoint(coord[3]);
    expect(path.trace).toEqual('M 1 2 L 3 4');
  });
  it('Should update properties', () => {
    path.updateProperties();
    expect(path.svgNode.style.fill).toEqual('none');
    expect(path.svgNode.style.strokeLinecap).toEqual('round');
    expect(path.svgNode.style.strokeLinejoin).toEqual('round');
  });
});
