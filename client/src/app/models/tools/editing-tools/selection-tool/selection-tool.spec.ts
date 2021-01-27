import { TestBed } from '@angular/core/testing';
import { SharedModule } from '@components/shared/shared.module';
import { MoveShapeCommand } from '@models/commands/shape-commands/move-shape-command';
import { EditorService } from '@services/editor.service';
import { MouseListenerService } from '@services/event-listeners/mouse-listener/mouse-listener.service';
import { SelectionMove } from '@tools/editing-tools/selection-tool/selection-move.enum';
import { Color } from '@utils/color/color';
import { Coordinate } from '@utils/math/coordinate';
import { BaseShape } from 'src/app/models/shapes/base-shape';
import { Rectangle } from 'src/app/models/shapes/rectangle';
import { SelectionTool } from 'src/app/models/tools/editing-tools/selection-tool/selection-tool';

/* tslint:disable:no-string-literal */
/* tslint:disable:no-magic-numbers */
/* tslint:disable:no-any */
/* tslint:disable:max-file-line-count */

const mouseDown = (c: Coordinate = new Coordinate(), rightClick: boolean = false): MouseEvent => {
  return {
    button: rightClick ? MouseListenerService.BUTTON_RIGHT : MouseListenerService.BUTTON_LEFT,
    type: 'mousedown',
    offsetX: c.x,
    offsetY: c.y,
  } as MouseEvent;
};

const mouseMove = (c: Coordinate = new Coordinate()): MouseEvent => {
  return {
    type: 'mousemove',
    offsetX: c.x,
    offsetY: c.y,
  } as MouseEvent;
};

const mouseUp = (c: Coordinate = new Coordinate()): MouseEvent => {
  return {
    type: 'mouseup',
    offsetX: c.x,
    offsetY: c.y,
  } as MouseEvent;
};

const mouseWheel = (delta: number): MouseEvent => {
  return {
    type: 'wheel',
    deltaY: delta,
    preventDefault: () => {
      return;
    },
  } as WheelEvent;
};

describe('SelectionTool', () => {
  let tool: SelectionTool;
  const coord1 = new Coordinate(100, 50);
  const coord2 = new Coordinate(150, 250);
  const coord3 = new Coordinate(50, 150);

  let shapes: BaseShape[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      providers: [EditorService],
    }).compileComponents();

    tool = new SelectionTool(TestBed.get(EditorService));
    shapes = [
      new Rectangle(coord1, 5, 5),
      new Rectangle(coord2, 50, 50),
      new Rectangle(coord3, 20, 20),
      new Rectangle(coord1, 200, 150),
    ];
  });

  it('should create an instance', () => {
    expect(tool).toBeTruthy();
  });

  it('can handle undo/redo event', () => {
    const clearSpy = spyOn(tool['selection'], 'clear');
    const updateSpy = spyOn(tool['selection'], 'updateBoundingBox');
    const applySpy = spyOn(tool, 'applyBoundingBox');

    tool.handleUndoRedoEvent(true);
    expect(clearSpy).toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalled();
    expect(applySpy).toHaveBeenCalled();
  });

  it('can handle wheel', () => {
    const rotateSpy = spyOn<any>(tool, 'rotateSelection');
    tool.handleMouseEvent(mouseWheel(1));
    expect(rotateSpy).not.toHaveBeenCalled();

    tool['selection'].shapes.push(...shapes);
    tool.handleMouseEvent(mouseWheel(1));
    expect(rotateSpy).toHaveBeenCalledWith(tool['ROTATION_AMOUNT'], tool['shiftKey']);

    rotateSpy.calls.reset();
    tool.handleMouseEvent(mouseWheel(-1));
    expect(rotateSpy).toHaveBeenCalledWith(-tool['ROTATION_AMOUNT'], tool['shiftKey']);

    rotateSpy.calls.reset();
    tool['altKey'] = true;
    tool.handleMouseEvent(mouseWheel(1));
    expect(rotateSpy).toHaveBeenCalledWith(1, tool['shiftKey']);
  });

  it('can handle mouse down', () => {
    const beginSpy = spyOn<any>(tool, 'beginSelection');
    const moveSpy = spyOn<any>(tool, 'startMove');
    // left click
    tool.handleMouseEvent(mouseDown(coord1, false));
    expect(tool['isActive']).toBeTruthy();
    expect(beginSpy).toHaveBeenCalledWith(coord1);
    // no double click
    tool.handleMouseDown(mouseDown(coord1, false));
    expect(beginSpy).toHaveBeenCalledTimes(1);
    // left drag
    tool['isActive'] = false;
    tool['selection'].shapes.push(shapes[0]);
    tool['selection'].updateBoundingBox();
    tool.handleMouseEvent(mouseDown(coord1, false));
    expect(moveSpy).toHaveBeenCalled();
    // right click
    beginSpy.calls.reset();
    tool['isActive'] = false;
    tool.handleMouseEvent(mouseDown(coord1, true));
    expect(tool['isActive']).toBeTruthy();
    expect(beginSpy).toHaveBeenCalledWith(coord1, true);
  });

  it('can handle mouse move', () => {
    const updateSpy = spyOn<any>(tool, 'updateSelection');

    tool.handleMouseEvent(mouseMove());
    expect(updateSpy).not.toHaveBeenCalled();

    tool['isActive'] = true;
    tool.handleMouseEvent(mouseMove());
    expect(updateSpy).toHaveBeenCalledTimes(1);

    tool['reverseSelectionMode'] = true;
    tool.handleMouseEvent(mouseMove());
    expect(updateSpy).toHaveBeenCalledWith(true);
  });

  it('can handle mouse up', () => {
    const applySpy = spyOn<any>(tool, 'applyBoundingBox');

    tool.handleMouseEvent(mouseUp());
    expect(applySpy).not.toHaveBeenCalled();

    tool['isActive'] = true;
    tool.handleMouseEvent(mouseUp());
    expect(applySpy).toHaveBeenCalled();
    expect(tool['isActive']).toBeFalsy();

    const endSpy = spyOn<any>(tool, 'endMove');
    tool['isActive'] = true;
    tool['moveSelectionMode'] = true;
    tool['mouseMoved'] = true;
    tool.handleMouseEvent(mouseUp());
    expect(endSpy).toHaveBeenCalled();
  });

  it('can rotate selection', () => {
    const angle = 30;
    tool['selection'].shapes.push(...shapes);
    tool['rotateSelection'](angle);

    tool['selection'].shapes.forEach((shape) => {
      expect(shape.rotation).toEqual(angle);
    });
  });

  it('can calculate keyboard move', () => {
    const up = [true, false, false, false];
    const upRight = [true, true, false, false];
    const upRightDown = [true, true, true, false];
    const upRightDownLeft = [true, true, true, true];
    const dist = SelectionMove.KEYBOARD_MOVE_DISTANCE;

    expect(tool['calculateKeyboardMove'](up)).toEqual(new Coordinate(0, -dist));
    expect(tool['calculateKeyboardMove'](upRight)).toEqual(new Coordinate(dist, -dist));
    expect(tool['calculateKeyboardMove'](upRightDown)).toEqual(new Coordinate(dist, 0));
    expect(tool['calculateKeyboardMove'](upRightDownLeft)).toEqual(new Coordinate(0, 0));
  });

  it('can handle keyboard move', () => {
    const startSpy = spyOn<any>(tool, 'startKeyboardMove');
    const endSpy = spyOn<any>(tool, 'endKeyboardMove');

    tool['handleKeyboardMove'](0, false); // end
    tool['handleKeyboardMove'](1, true); // start
    tool['handleKeyboardMove'](0, true); // start
    tool['handleKeyboardMove'](1, false); // start
    tool['handleKeyboardMove'](0, false); // end

    expect(startSpy).toHaveBeenCalledTimes(3);
    expect(endSpy).toHaveBeenCalledTimes(2);
  });

  it('can start keyboard move', () => {
    jasmine.clock().install();
    const moveSpy = spyOn<any>(tool, 'move');
    tool['initBoundingBox']();
    tool['selection'].shapes.push(new Rectangle());

    tool['keyTimeout'] = 1;
    tool['startKeyboardMove']();
    expect(moveSpy).not.toHaveBeenCalled();
    tool['keyTimeout'] = 0;

    tool['startKeyboardMove']();
    expect(moveSpy).toHaveBeenCalledTimes(1);

    jasmine.clock().tick(SelectionMove.KEYBOARD_TIMEOUT + 5);
    expect(moveSpy).toHaveBeenCalledTimes(2);
    jasmine.clock().tick(SelectionMove.KEYBOARD_INTERVAL + 5);
    expect(moveSpy).toHaveBeenCalledTimes(3);

    jasmine.clock().uninstall();
  });

  it('can end keyboard move', () => {
    const endSpy = spyOn<any>(tool, 'endMove');
    const tSpy = spyOn(window, 'clearTimeout');
    const iSpy = spyOn(window, 'clearInterval');
    const timeout = 23;
    const interval = 12;

    tool['keyTimeout'] = timeout;
    tool['keyInterval'] = interval;
    tool['endKeyboardMove']();

    expect(endSpy).toHaveBeenCalled();
    expect(tSpy).toHaveBeenCalledWith(timeout);
    expect(iSpy).toHaveBeenCalledWith(interval);
    expect(tool['keyTimeout']).toEqual(0);
    expect(tool['keyInterval']).toEqual(0);
  });

  it('can move selected shapes', () => {
    tool['initBoundingBox']();
    tool['selection'].shapes.push(new Rectangle());
    tool['startMove']();
    const moveSpy = spyOn(tool['moveCommand'], 'execute');

    tool['move']();
    expect(tool['moveCommand'].delta).toEqual(Coordinate.subtract(tool['mousePosition'], tool['initialMouseCoord']));
    const c = new Coordinate(50, 75);
    tool['move'](c);
    expect(tool['moveCommand'].delta).toEqual(c);
    expect(moveSpy).toHaveBeenCalledTimes(2);
  });

  it('can end move', () => {
    const command = new MoveShapeCommand(tool['selection'].shapes, tool.editorService);
    tool['moveCommand'] = command;
    tool['endMove']();
    expect(tool.editorService.commandReceiver['_commands'].pop()).toEqual(command);
  });

  it('can select single shape', () => {
    tool.selectShape(shapes[0]);
    expect(tool['selection'].shapes.indexOf(shapes[0])).toEqual(0);

    tool['mouseMoved'] = true;
    tool.selectShape(shapes[2]);
    expect(tool['selection'].shapes.indexOf(shapes[0])).toEqual(0);
    expect(tool['selection'].shapes.indexOf(shapes[2])).toEqual(-1);
  });

  it('can reverse selection', () => {
    tool.selectShape(shapes[0]);
    tool['selection'].addSelectedShape(shapes[1]);

    tool.selectShape(shapes[1], true);
    tool.selectShape(shapes[2], true);

    expect(tool['selection'].shapes.length).toEqual(2);
    expect(tool['selection'].shapes.indexOf(shapes[0])).toEqual(0);
    expect(tool['selection'].shapes.indexOf(shapes[1])).toEqual(-1);
    expect(tool['selection'].shapes.indexOf(shapes[2])).toEqual(1);
  });

  it('should not add shape if already selected', () => {
    tool['selection'].addSelectedShape(shapes[0]);
    tool['selection'].addSelectedShape(shapes[1]);
    tool['selection'].addSelectedShape(shapes[0]);
    tool['selection'].addSelectedShape(shapes[0]);
    expect(tool['selection'].shapes.length).toEqual(2);
  });

  it('can remove selected shape', () => {
    tool['selection'].addSelectedShape(shapes[0]);
    tool['selection'].addSelectedShape(shapes[1]);
    tool['selection']['removeSelectedShape'](shapes[0]);
    expect(tool['selection'].shapes.indexOf(shapes[1])).toEqual(0);
    expect(tool['selection'].shapes.length).toEqual(1);
  });

  it('should not remove shape if not selected', () => {
    const spliceSpy = spyOn(tool['selection'].shapes, 'splice');
    tool['selection'].addSelectedShape(shapes[0]);
    tool['selection']['removeSelectedShape'](shapes[1]);
    expect(tool['selection'].shapes.length).toEqual(1);
    expect(spliceSpy).not.toHaveBeenCalled();
  });

  it('can select all shapes', () => {
    tool.editorService.addShapeToBuffer(shapes[0]);
    tool.editorService.addShapeToBuffer(shapes[1]);
    tool.editorService.addShapeToBuffer(shapes[2]);
    tool.editorService.applyShapesBuffer();

    tool.selectAll();
    expect(tool['selection'].shapes.length).toEqual(3);
  });

  it('can begin selection', () => {
    tool['beginSelection'](coord1);

    expect(tool['reverseSelectionMode']).toBeFalsy();
    expect(tool['initialMouseCoord']).toEqual(coord1);
    expect(tool['selection'].shapes.length).toEqual(0);
  });

  it('can begin reverse selection', () => {
    tool['beginSelection'](coord1, true);

    expect(tool['reverseSelectionMode']).toBeTruthy();
    expect(tool['initialMouseCoord']).toEqual(coord1);
    expect(tool['selection'].previous).toEqual(tool['selection'].shapes);
  });

  it('can initialize select area', () => {
    const addPreviewSpy = spyOn(tool.editorService, 'addPreviewShape').and.callThrough();

    tool['initialMouseCoord'] = coord1;
    tool['initSelectArea']();

    expect(addPreviewSpy).toHaveBeenCalled();
    expect(tool.editorService['previewShapes'][0].primaryColor).toEqual(Color.TRANSPARENT);
    expect(tool.editorService['previewShapes'][0].origin).toEqual(coord1);
  });

  it('can initialize bounding box', () => {
    const addPreviewSpy = spyOn(tool.editorService, 'addPreviewShape').and.callThrough();

    tool['initialMouseCoord'] = coord1;
    tool['initBoundingBox']();

    expect(addPreviewSpy).toHaveBeenCalled();
    expect(tool.editorService['previewShapes'][0].origin).toEqual(coord1);
  });

  it('can reset selection', () => {
    tool.selectShape(shapes[0]);
    tool['selection'].addSelectedShape(shapes[1]);
    tool['selection'].addSelectedShape(shapes[2]);
    const addPreviewSpy = spyOn(tool.editorService, 'addPreviewShape');

    tool['resetSelection']();
    expect(tool.editorService['previewShapes'].length).toEqual(0);
    expect(tool['selection'].shapes.length).toEqual(0);
    expect(addPreviewSpy).toHaveBeenCalledTimes(2);
  });

  it('can apply bounding box', () => {
    tool.selectShape(shapes[0]);
    tool['applyBoundingBox']();

    expect(tool.editorService['previewShapes'].length).toEqual(1);
    expect(tool.editorService['previewShapes'][0]).toEqual(tool['selection'].boundingBox);
  });

  it('can update selection', () => {
    const resetSpy = spyOn<any>(tool, 'resetSelection');
    const resizeSpy = spyOn<any>(tool['selection'], 'resizeArea');
    const addSpy = spyOn<any>(tool['selection'], 'addSelectedShape');
    const updateSpy = spyOn<any>(tool['selection'], 'updateBoundingBox');

    tool.editorService.shapes.push(...shapes);
    tool['selection'].area.origin = new Coordinate();
    tool['selection'].area.end = new Coordinate(500, 500);
    tool['updateSelection']();

    expect(resetSpy).toHaveBeenCalled();
    expect(resizeSpy).toHaveBeenCalled();
    expect(addSpy).toHaveBeenCalledTimes(4);
    expect(updateSpy).toHaveBeenCalled();
  });

  it('can update reverse selection', () => {
    const resetSpy = spyOn<any>(tool, 'resetSelection');
    const resizeSpy = spyOn<any>(tool['selection'], 'resizeArea');
    const reverseSpy = spyOn<any>(tool['selection'], 'reverse');
    const updateSpy = spyOn<any>(tool['selection'], 'updateBoundingBox');

    tool.editorService.shapes.push(...shapes);
    tool['selection'].shapes.push(shapes[0]);
    tool['beginSelection'](new Coordinate(), true);
    tool['selection'].area.origin = new Coordinate();
    tool['selection'].area.end = new Coordinate(500, 500);
    tool['updateSelection'](true);

    expect(resetSpy).toHaveBeenCalled();
    expect(resizeSpy).toHaveBeenCalled();
    expect(reverseSpy).toHaveBeenCalledTimes(4);
    expect(updateSpy).toHaveBeenCalled();
  });
});
