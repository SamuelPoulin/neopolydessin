/* tslint:disable:no-magic-numbers */
import { EditorUtils } from '@utils/color/editor-utils';
import { Rectangle } from 'src/app/models/shapes/rectangle';
import { Coordinate } from 'src/app/utils/math/coordinate';

describe('Rectangle', () => {
  let rectangle: Rectangle;
  beforeEach(() => {
    rectangle = new Rectangle();
  });
  it('Can read shape', () => {
    rectangle.width = 50;
    rectangle.height = 60;
    rectangle.origin = new Coordinate(20, 30);
    const rectangle2 = EditorUtils.createShape(JSON.parse(JSON.stringify(rectangle)));
    expect(Object.values(rectangle2)).toEqual(Object.values(rectangle));
  });
  it('should init with width = 0', () => {
    expect(rectangle.width).toBe(0);
  });
  it('should init with height = 0', () => {
    expect(rectangle.height).toBe(0);
  });
  it('Should have height = 0 on invalid inputs', () => {
    rectangle.height = Number.NaN;
    expect(rectangle.height).toBe(0);
  });
  it('Should have width = 0 on invalid inputs', () => {
    rectangle.width = Number.NaN;
    expect(rectangle.width).toBe(0);
  });
  it('Should have positive height on negative values', () => {
    rectangle.height = -5;
    expect(rectangle.height).toBe(5);
  });
  it('Should have positive width on negative values', () => {
    rectangle.width = -5;
    expect(rectangle.width).toBe(5);
  });
  it('Should have center.x = 0 on init', () => {
    expect(rectangle.center.x).toBe(0);
  });
  it('Should have center.y = 0 on init', () => {
    expect(rectangle.center.y).toBe(0);
  });
  it('should create', () => {
    expect(rectangle).toBeTruthy();
  });
  it('Should have positive height', () => {
    rectangle.height = -7;
    expect(rectangle.height).toEqual(7);
    expect(rectangle.svgNode.getAttribute('height')).toEqual('7');
  });
  it('Should have positive width', () => {
    rectangle.width = -10;
    expect(rectangle.width).toEqual(10);
    expect(rectangle.svgNode.getAttribute('width')).toEqual('10');
  });
  it('Should have the given coordinates', () => {
    const coord: Coordinate = new Coordinate(-50, 10);
    rectangle.origin = coord;
    expect(rectangle.origin).toEqual(coord);
    expect(rectangle.svgNode.getAttribute('x')).toEqual('-50');
    expect(rectangle.svgNode.getAttribute('y')).toEqual('10');
  });
  it('Should give you the center', () => {
    const centerX: number = rectangle.width / 2 + rectangle.origin.x;
    const centerY: number = rectangle.height / 2 + rectangle.origin.y;
    const coord: Coordinate = new Coordinate(centerX, centerY);
    expect(rectangle.center).toEqual(coord);
  });
  it('Can set rectangle start coordinate and resize accordingly', () => {
    const dimensions = new Coordinate(40, 50);
    const offset = new Coordinate(10, 20);
    const origin = new Coordinate();
    const end = Coordinate.add(origin, dimensions);
    const start = Coordinate.add(origin, offset);

    rectangle.origin = Coordinate.copy(origin);
    rectangle.end = Coordinate.copy(end);
    rectangle.start = start;

    expect(rectangle.width).toEqual(dimensions.x - offset.x);
    expect(rectangle.height).toEqual(dimensions.y - offset.y);
    expect(rectangle.origin).toEqual(start);
    expect(rectangle.end).toEqual(end);
  });
  it('Can set rectangle end coordinate and resize accordingly', () => {
    const width = 40;
    const height = 50;
    const origin = new Coordinate();
    const end = new Coordinate(width, height);
    rectangle.origin = Coordinate.copy(origin);
    rectangle.end = Coordinate.copy(end);

    expect(rectangle.width).toEqual(width);
    expect(rectangle.height).toEqual(height);
    expect(rectangle.origin).toEqual(origin);
    expect(rectangle.end).toEqual(end);
  });
});
