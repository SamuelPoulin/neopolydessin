/* tslint:disable:no-magic-numbers no-string-literal */
import { BaseShape } from '@models/shapes/base-shape';
import { EditorUtils } from '@utils/color/editor-utils';
import { CompositeLine } from 'src/app/models/shapes/composite-line';
import { Line } from 'src/app/models/shapes/line';
import { Coordinate } from 'src/app/utils/math/coordinate';
import { Ellipse } from './ellipse';

describe('CompositeLine', () => {
  let cLine: CompositeLine;
  const coord: Coordinate[] = new Array<Coordinate>();
  coord[0] = new Coordinate(0, 0);
  coord[1] = new Coordinate(2, 2);
  coord[2] = new Coordinate(17, 8);
  coord[3] = new Coordinate(2, 3);
  beforeEach(() => {
    cLine = new CompositeLine(coord[0]);
  });
  it('Can read shape', () => {
    for (let i = 0; i < coord.length; i++) {
      cLine.addPoint(coord[i]);
      cLine.updateCurrentCoord(coord[(i + 1) % coord.length]);
      cLine.confirmPoint();
    }
    const cLine2 = EditorUtils.createShape(JSON.parse(JSON.stringify(cLine))) as CompositeLine;
    expect(Object.values(cLine2.lineArray)).toEqual(Object.values(cLine.lineArray));
    expect(Object.values(cLine2.junctionArray)).toEqual(Object.values(cLine.junctionArray));
  });
  it('Should init with line with only (0, 0) coordinates', () => {
    expect(cLine.center).toEqual(coord[0]);
  });
  it('Should call addPoint when confirming point', () => {
    const addPointSpy = spyOn(cLine, 'addPoint');
    cLine.confirmPoint();
    expect(addPointSpy).toHaveBeenCalledWith(cLine.currentLine.endCoord);
  });
  it('Should call addLine and addJunction when adding point', () => {
    const addLineSpy = spyOn(cLine, 'addLine');
    const addJunctionSpy = spyOn(cLine, 'addJunction');
    cLine.addPoint(coord[1]);
    expect(addLineSpy).toHaveBeenCalledWith(coord[1]);
    expect(addJunctionSpy).toHaveBeenCalledWith(coord[1]);
  });
  it('Should add line at the end of lineArray', () => {
    BaseShape['SHAPE_ID'] = 0;
    cLine.addLine(coord[1]);
    BaseShape['SHAPE_ID'] = 0;
    const line = new Line(coord[1]);
    expect(cLine.lineArray.pop()).toEqual(line);
    expect(cLine.svgNode.querySelector('line')).toBeTruthy();
  });
  it('Should add junction at the end of junctionArray', () => {
    BaseShape['SHAPE_ID'] = 0;
    cLine.addJunction(coord[1]);
    BaseShape['SHAPE_ID'] = 0;
    const ellipse = new Ellipse(coord[1]);
    expect(cLine.currentJunction).toEqual(ellipse);
    expect(cLine.svgNode.querySelector('ellipse')).toBeTruthy();
  });
  it('Should update the current line', () => {
    cLine.updateCurrentCoord(coord[2]);
    expect(cLine.lineArray[cLine.lineArray.length - 1].endCoord).toEqual(coord[2]);
  });
  it('Should call removePoints twice to remove two points ', () => {
    const removeLastPointSpy = spyOn(cLine, 'removeLastPoint');
    cLine.endLine(coord[3]);
    expect(removeLastPointSpy).toHaveBeenCalledTimes(2);
  });
  it('Should add a junction because max distance is to long', () => {
    const addJunctionSpy = spyOn(cLine, 'addJunction');
    cLine.addPoint(coord[1]);
    cLine.endLine(coord[2]);
    expect(addJunctionSpy).toHaveBeenCalledWith(cLine.currentLine.endCoord);
  });
  it('Should snap so should update current coordinates', () => {
    const updateCurrentCoordSpy = spyOn(cLine, 'updateCurrentCoord');
    cLine.endLine(coord[1]);
    expect(updateCurrentCoordSpy).toHaveBeenCalledWith(cLine.lineArray[0].startCoord);
  });
  it('Should return false because there are no elements to remove', () => {
    cLine.lineArray.pop();
    cLine.junctionArray.pop();
    expect(cLine.removeLastPoint()).toEqual(false);
  });
  it('Should return false when there are no elements left left after remove', () => {
    expect(cLine.removeLastPoint()).toEqual(false);
  });
  it('Should return true and should give the end coordinates of the removed line to the last line', () => {
    const removeChildSpy = spyOn(cLine.svgNode, 'removeChild');
    cLine.addPoint(coord[3]);
    cLine.addPoint(coord[2]);
    const lastLine = cLine.lineArray[cLine.lineArray.length - 1];
    const lastJunction = cLine.junctionArray[cLine.junctionArray.length - 1];
    const arrayJunctionLength: number = cLine.junctionArray.length;
    const arrayLineLength: number = cLine.lineArray.length;
    cLine.removeLastPoint();
    expect(cLine.lineArray.length).toEqual(arrayLineLength - 1);
    expect(cLine.junctionArray.length).toEqual(arrayJunctionLength - 1);
    expect(cLine.currentLine.endCoord).toEqual(lastLine.endCoord);
    expect(removeChildSpy).toHaveBeenCalledWith(lastLine.svgNode);
    expect(removeChildSpy).toHaveBeenCalledWith(lastJunction.svgNode);
    expect(cLine.removeLastPoint).toBeTruthy();
  });
  it('Should set origin to given coordinate', () => {
    cLine.origin = coord[2];
    expect(cLine.origin).toEqual(coord[2]);
  });
});
