/* tslint:disable: no-magic-numbers no-string-literal no-any*/
import { EditorUtils } from '@utils/color/editor-utils';
import { Coordinate } from 'src/app/utils/math/coordinate';
import { Polygon } from './polygon';

describe('Polygon', () => {
  let polygon: Polygon;
  beforeEach(() => {
    polygon = new Polygon();
  });

  it('Can read shape', () => {
    polygon.nEdges = 8;
    polygon.updatePoints(new Coordinate(80, 100), new Coordinate(10, 25));
    const polygon2 = EditorUtils.createShape(JSON.parse(JSON.stringify(polygon)));
    expect(Object.values(polygon2)).toEqual(Object.values(polygon));
  });
  it('should create an instance', () => {
    expect(polygon).toBeTruthy();
  });
  it('should be at MIN_POLY_EDGE in lower edge case', () => {
    polygon.nEdges = 2;
    expect(polygon.nEdges).toBe(Polygon.MIN_POLY_EDGES);
  });
  it('should be at MAX_POLY_EDGE in higher edge case', () => {
    polygon.nEdges = Polygon.MAX_POLY_EDGES + 1;
    expect(polygon.nEdges).toBe(Polygon.MAX_POLY_EDGES);
  });
  it('should be at MIN_POLY_EDGE in unexpected cases', () => {
    polygon.nEdges = NaN;
    expect(polygon.nEdges).toBe(Polygon.MIN_POLY_EDGES);
  });
  it('Should init with interiorAngle at 2Pi/ nEdges', () => {
    expect(polygon.interiorAngle).toBe((2 * Math.PI) / polygon.nEdges);
  });
  it('Should change internal angle on nEdges change', () => {
    const initialAngle = polygon.interiorAngle;
    polygon.nEdges = 6;
    expect(polygon.interiorAngle !== initialAngle).toBe(true);
    expect(polygon.interiorAngle).toBe(Math.PI / 3);
  });
  it('should give a height of 0', () => {
    expect(polygon.height).toEqual(0);
  });
  it('should give a height of 0', () => {
    expect(polygon.height).toEqual(0);
  });
  it('should have a height of 50 or width of 50', () => {
    const spy = spyOn<any>(polygon, 'applyPoints').and.callThrough();
    polygon.updatePoints(new Coordinate(50, 50), new Coordinate());
    expect([Math.round(polygon.height), Math.round(polygon.width)]).toContain(50);
    expect(spy).toHaveBeenCalledWith(Coordinate.abs(new Coordinate(50, 50)));
  });
  it('should set attribute points', () => {
    polygon['points'].push(new Coordinate(50, 50));
    polygon['drawPoints']();
    expect(polygon.svgNode.getAttribute('points')).toEqual('50,50 ');
  });
  it('Should be the right origin', () => {
    polygon['points'].push(new Coordinate(50, 50));
    polygon['points'].push(new Coordinate(20, 10));
    polygon['points'].push(new Coordinate(10, 30));
    expect(polygon.origin.x).toEqual(polygon['relativeOrigin'].x + polygon.offset.x);
    expect(polygon.origin.y).toEqual(polygon['relativeOrigin'].y + polygon.offset.y);
  });
  it('should reset origin because x dimension is negative', () => {
    polygon.updatePoints(new Coordinate(-50, 50), new Coordinate());
    expect(Math.round(polygon.origin.x)).toEqual(Math.round(polygon.origin.x + Coordinate.abs(new Coordinate(-50, 50)).x - polygon.width));
    expect(polygon.origin.y).toEqual(polygon.origin.y);
  });
  it('should reset origin because y dimension is negative', () => {
    polygon.updatePoints(new Coordinate(50, -50), new Coordinate());
    expect(Math.round(polygon.origin.y)).toEqual(Math.round(polygon.origin.y + Coordinate.abs(new Coordinate(-50, 50)).y - polygon.width));
    expect(polygon.origin.x).toEqual(polygon.origin.x);
  });
  it('should return early', () => {
    const applySpy = spyOn<any>(polygon, 'applyPoints');
    polygon.updatePoints(new Coordinate(0, 0), new Coordinate());
    expect(applySpy).not.toHaveBeenCalled();
  });
});
