/* tslint:disable:no-string-literal */
/* tslint:disable:no-magic-numbers */
import { BaseShape } from '@models/shapes/base-shape';
import { Rectangle } from '@models/shapes/rectangle';
import { Selection } from '@models/tools/editing-tools/selection-tool/selection';
import { Coordinate } from '@utils/math/coordinate';

describe('Selection', () => {
  let selection: Selection;
  const coord1 = new Coordinate(100, 50);
  const coord2 = new Coordinate(150, 250);
  const coord3 = new Coordinate(50, 150);

  const shapes: BaseShape[] = [
    new Rectangle(coord1, 5, 5),
    new Rectangle(coord2, 50, 50),
    new Rectangle(coord3, 20, 20),
    new Rectangle(coord1, 200, 150),
  ];

  beforeEach(() => {
    selection = new Selection();
  });

  it('can determine empty state', () => {
    expect(selection.isEmpty).toBeTruthy();
    selection.shapes.push(shapes[0]);
    expect(selection.isEmpty).toBeFalsy();
  });

  it('can detect bounding box collision', () => {
    expect(Selection.detectBoundingBoxCollision(shapes[3] as Rectangle, shapes[0])).toBeTruthy();
    expect(Selection.detectBoundingBoxCollision(shapes[2] as Rectangle, shapes[2])).toBeTruthy();
    expect(Selection.detectBoundingBoxCollision(shapes[1] as Rectangle, shapes[3])).toBeFalsy();
    expect(Selection.detectBoundingBoxCollision(shapes[0] as Rectangle, shapes[1])).toBeFalsy();
  });

  it('can clear selection', () => {
    selection.clear();
    expect(selection.shapes).toEqual([]);
  });

  it('can update bounding box for single shape', () => {
    selection.addSelectedShape(shapes[0]);
    selection.updateBoundingBox();

    expect(selection.boundingBox.origin).toEqual(new Coordinate(99.5, 49.5));
    expect(selection.boundingBox.end).toEqual(new Coordinate(105.5, 55.5));
  });

  it('can update bounding box', () => {
    selection.addSelectedShape(shapes[0]);
    selection.addSelectedShape(shapes[1]);
    selection.addSelectedShape(shapes[2]);
    selection.addSelectedShape(shapes[3]);

    selection.updateBoundingBox();

    expect(selection.boundingBox.origin).toEqual(new Coordinate(49.5, 49.5));
    expect(selection.boundingBox.end).toEqual(new Coordinate(300.5, 300.5));
  });

  it('can update empty bounding box', () => {
    selection.updateBoundingBox();

    expect(selection.shapes.length).toEqual(0);
    expect(selection.boundingBox.origin).toEqual(new Coordinate());
    expect(selection.boundingBox.end).toEqual(new Coordinate());
  });

  it('can resize select area', () => {
    selection.resizeArea(coord1, coord2);
    expect(selection.area.origin).toEqual(coord1);
    expect(selection.area.end).toEqual(coord2);
  });
});
