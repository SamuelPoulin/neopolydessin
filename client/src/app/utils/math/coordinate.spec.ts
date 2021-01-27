/* tslint:disable:no-magic-numbers */
import { Coordinate } from 'src/app/utils/math/coordinate';

describe('Coordinate', () => {
  let coordinate: Coordinate;
  beforeEach(() => {
    coordinate = new Coordinate();
  });
  it('should create at x = 0 ', () => {
    expect(coordinate.x).toBe(0.0);
  });
  it('should create at y = 0 ', () => {
    expect(coordinate.y).toBe(0.0);
  });
  it('should create', () => {
    expect(coordinate).toBeTruthy();
  });
  it('Should add coordinates', () => {
    const coord1: Coordinate = new Coordinate(23, -7);
    const coord2: Coordinate = new Coordinate(-9, 43);
    const expectedCoord: Coordinate = new Coordinate(14, 36);
    const coordSum: Coordinate = Coordinate.add(coord1, coord2);
    expect(coordSum).toEqual(expectedCoord);
  });
  it('Should subtract second coordinate to first coordinate', () => {
    const coord1: Coordinate = new Coordinate(44, -9);
    const coord2: Coordinate = new Coordinate(7, -23);
    const expectedCoord: Coordinate = new Coordinate(37, 14);
    const coordSub: Coordinate = Coordinate.subtract(coord1, coord2);
    expect(coordSub).toEqual(expectedCoord);
  });
  it('Should set coordinates to their absolute value', () => {
    const coord: Coordinate = new Coordinate(-9, 43);
    const expectedCoord: Coordinate = new Coordinate(9, 43);
    const coordAbs: Coordinate = Coordinate.abs(coord);
    expect(coordAbs).toEqual(expectedCoord);
  });
  it('Should return the minimum coordinates', () => {
    const coord1: Coordinate = new Coordinate(7, -23);
    const coord2: Coordinate = new Coordinate(3, 5);
    const expectedCoord: Coordinate = new Coordinate(3, -23);
    expect(Coordinate.minXYCoord(coord1, coord2)).toEqual(expectedCoord);
  });
  it('should return other coordinate if one is undefined on minXYCoord', () => {
    const coord: Coordinate = new Coordinate(3, 5);
    // @ts-ignore
    expect(Coordinate.minXYCoord(undefined, coord)).toEqual(coord);
    // @ts-ignore
    expect(Coordinate.minXYCoord(coord, undefined)).toEqual(coord);
  });
  it('should return other coordinate if one is undefined on maxXYCoord', () => {
    const coord: Coordinate = new Coordinate(3, 5);
    // @ts-ignore
    expect(Coordinate.maxXYCoord(undefined, coord)).toEqual(coord);
    // @ts-ignore
    expect(Coordinate.maxXYCoord(coord, undefined)).toEqual(coord);
  });
  it('Should give the minimum distance between coordinates', () => {
    const coord1: Coordinate = new Coordinate(7, -23);
    const coord2: Coordinate = new Coordinate(3, 5);
    const expectedValue = 4;
    expect(Coordinate.minXYDistance(coord1, coord2)).toEqual(expectedValue);
  });
  it('Should give maximum distance between coordinates', () => {
    const coord1: Coordinate = new Coordinate(44, -9);
    const coord2: Coordinate = new Coordinate(7, -23);
    const expectedValue = 37;
    expect(Coordinate.maxXYDistance(coord1, coord2)).toEqual(expectedValue);
  });
  it('Should give angle between coordinates line and abscissa', () => {
    const coord1: Coordinate = new Coordinate(10, 5);
    const coord2: Coordinate = new Coordinate(8, 3);
    const expectedValue: number = Math.PI / 4;
    expect(Coordinate.absAngle(coord1, coord2)).toEqual(expectedValue);
  });
});
