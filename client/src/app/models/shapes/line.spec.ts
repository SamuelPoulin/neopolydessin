/* tslint:disable:no-magic-numbers */
import { EditorUtils } from '@utils/color/editor-utils';
import { Line } from 'src/app/models/shapes/line';
import { Coordinate } from 'src/app/utils/math/coordinate';

describe('Line', () => {
  let line: Line;
  beforeEach(() => {
    line = new Line();
  });
  it('Can read shape', () => {
    line.startCoord = new Coordinate(20, 50);
    line.endCoord = new Coordinate(40, 30);
    const line2 = EditorUtils.createShape(JSON.parse(JSON.stringify(line)));
    expect(Object.values(line2)).toEqual(Object.values(line));
  });
  it('Should have center.x at 0 on init ', () => {
    expect(line.center.x).toBe(0);
  });
  it('Should have center.y at 0 on init ', () => {
    expect(line.center.y).toBe(0);
  });
  it('should create', () => {
    expect(line).toBeTruthy();
  });
  it('Should set svgNode to given start coordinates', () => {
    const coord: Coordinate = new Coordinate(-15, 43);
    line.startCoord = coord;
    expect(line.startCoord).toEqual(coord);
    expect(line.svgNode.getAttribute('x1')).toEqual('-15');
    expect(line.svgNode.getAttribute('y1')).toEqual('43');
  });
  it('Should set svgNode to given end coordinates', () => {
    const coord: Coordinate = new Coordinate(53, 17);
    line.endCoord = coord;
    expect(line.endCoord).toEqual(coord);
    expect(line.svgNode.getAttribute('x2')).toEqual('53');
    expect(line.svgNode.getAttribute('y2')).toEqual('17');
  });
  it('Should give correct center', () => {
    const coordStart: Coordinate = new Coordinate(-16, 42);
    const coordEnd: Coordinate = new Coordinate(54, 18);
    line.startCoord = coordStart;
    line.endCoord = coordEnd;
    const expectedCenter: Coordinate = new Coordinate(19, 30);
    expect(line.center).toEqual(expectedCenter);
  });
  it('Should set origin to given coordinates', () => {
    const coord: Coordinate = new Coordinate(0, 5);
    line.origin = coord;
    expect(line.origin).toEqual(coord);
  });
});
