/* tslint:disable:no-magic-numbers */
import { Color } from '@utils/color/color';
import { Coordinate } from '@utils/math/coordinate';
import { ColorFillUtils, ColorGetter, ColorSetter } from './color-fill-utils';

describe('ColorFillUtils', () => {
  let data: number[][];
  const valueToColor = (value: number): Color => {
    switch (value) {
      case 0:
        return Color.BLACK;
      case 1:
        return Color.WHITE;
      case 2:
        return Color.RED;
      case 3:
        return Color.rgb(0, 0, 1);
      default:
        return Color.BLUE;
    }
  };

  const colorToValue = (color: Color): number => {
    if (color.compare(Color.WHITE)) {
      return 1;
    } else if (color.compare(Color.BLACK)) {
      return 0;
    } else if (color.compare(Color.RED)) {
      return 2;
    } else {
      return 3;
    }
  };

  /* returns Black for 0, White for 1, Red for 1/3*/
  const getColor: ColorGetter = (point) => {
    if (point.x < 0 || point.y < 0 || point.y >= 10 || point.x >= 10) {
      return undefined;
    }
    return valueToColor(data[point.y][point.x]);
  };

  const setColor: ColorSetter = (point, color) => {
    data[point.y][point.x] = colorToValue(color);
  };

  const dataToString = (values: number[][]) => {
    let str = '\n';
    values.forEach((row, x) => {
      row.forEach((val, y) => {
        str += values[x][y];
      });
      str += '\n';
    });
    return str;
  };

  let util: ColorFillUtils;

  beforeEach(() => {
    util = new ColorFillUtils(getColor, setColor);
    data = [
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      [3, 3, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 0, 0, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 1, 1, 0, 1, 1, 0],
      [0, 0, 0, 1, 1, 0, 0, 0, 1, 1],
      [0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];
  });

  it('should create an instance', () => {
    expect(util).toBeTruthy();
  });

  it('can flood fill a square bordered by the bounds', () => {
    const expectedData: number[][] = [
      [2, 2, 1, 0, 0, 0, 0, 0, 0, 0],
      [3, 3, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 0, 0, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 1, 1, 0, 1, 1, 0],
      [0, 0, 0, 1, 1, 0, 0, 0, 1, 1],
      [0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

    util.floodFill(new Coordinate(), valueToColor(0), valueToColor(2));
    expect(dataToString(data)).toEqual(dataToString(expectedData));
  });

  it('can flood fill a square bordered by the bounds with high tolerance', () => {
    const expectedData: number[][] = [
      [2, 2, 1, 0, 0, 0, 0, 0, 0, 0],
      [2, 2, 1, 0, 0, 0, 0, 0, 0, 0],
      [2, 2, 1, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 0, 0, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 1, 1, 0, 1, 1, 0],
      [0, 0, 0, 1, 1, 0, 0, 0, 1, 1],
      [0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

    util.floodFill(new Coordinate(), valueToColor(0), valueToColor(2), 1 / 3);
    expect(dataToString(data)).toEqual(dataToString(expectedData));
  });

  it('can flood fill a square bordered by the bounds with highest tolerance', () => {
    const expectedData: number[][] = [
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    ];

    util.floodFill(new Coordinate(), valueToColor(0), valueToColor(2), 1);
    expect(dataToString(data)).toEqual(dataToString(expectedData));
  });

  it('can flood fill a square bordered by the bounds with low tolerance', () => {
    const expectedData: number[][] = [
      [2, 2, 1, 0, 0, 0, 0, 0, 0, 0],
      [3, 3, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 0, 0, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 1, 1, 0, 1, 1, 0],
      [0, 0, 0, 1, 1, 0, 0, 0, 1, 1],
      [0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

    util.floodFill(new Coordinate(), valueToColor(0), valueToColor(2), 0.1);
    expect(dataToString(data)).toEqual(dataToString(expectedData));
  });

  it('can flood fill a line', () => {
    const expectedData: number[][] = [
      [0, 0, 2, 0, 0, 0, 0, 0, 0, 0],
      [3, 3, 2, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 2, 0, 0, 0, 0, 0, 0, 0],
      [2, 2, 2, 0, 0, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 1, 1, 0, 1, 1, 0],
      [0, 0, 0, 1, 1, 0, 0, 0, 1, 1],
      [0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

    util.floodFill(new Coordinate(2, 0), valueToColor(1), valueToColor(2));
    expect(dataToString(data)).toEqual(dataToString(expectedData));
  });

  it('can flood fill a triangle', () => {
    const expectedData: number[][] = [
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      [3, 3, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 0, 0, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 1, 1, 2, 1, 1, 0],
      [0, 0, 0, 1, 1, 2, 2, 2, 1, 1],
      [0, 0, 0, 1, 2, 2, 2, 2, 2, 1],
      [0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

    util.floodFill(new Coordinate(6, 5), valueToColor(0), valueToColor(2));
    expect(dataToString(data)).toEqual(dataToString(expectedData));
  });

  it('can flood fill outside', () => {
    const expectedData: number[][] = [
      [0, 0, 1, 2, 2, 2, 2, 2, 2, 2],
      [3, 3, 1, 2, 2, 2, 2, 2, 2, 2],
      [0, 0, 1, 2, 2, 2, 2, 2, 2, 2],
      [1, 1, 1, 2, 2, 1, 1, 1, 2, 2],
      [2, 2, 2, 2, 1, 1, 0, 1, 1, 2],
      [2, 2, 2, 1, 1, 0, 0, 0, 1, 1],
      [2, 2, 2, 1, 0, 0, 0, 0, 0, 1],
      [2, 2, 2, 1, 1, 1, 1, 1, 1, 1],
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    ];

    util.floodFill(new Coordinate(3, 0), valueToColor(0), valueToColor(2));
    expect(dataToString(data)).toEqual(dataToString(expectedData));
  });
});
