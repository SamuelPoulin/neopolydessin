/* tslint:disable:no-string-literal no-magic-numbers */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GridComponent } from '@components/pages/editor/drawing-surface/grid/grid.component';
import { ToolbarModule } from '@components/pages/editor/toolbar/toolbar.module';
import { DrawingSurfaceComponent } from 'src/app/components/pages/editor/drawing-surface/drawing-surface.component';
import { EditorComponent } from 'src/app/components/pages/editor/editor/editor.component';
import { SharedModule } from 'src/app/components/shared/shared.module';
import { CompositeLine } from 'src/app/models/shapes/composite-line';
import { LineJunctionType } from 'src/app/models/tool-properties/creator-tool-properties/line-junction-type.enum';
import { LineTool } from 'src/app/models/tools/creator-tools/line-tool/line-tool';
import { ColorsService } from 'src/app/services/colors.service';
import { EditorService } from 'src/app/services/editor.service';
import { Coordinate } from 'src/app/utils/math/coordinate';

describe('LineTool', () => {
  let lineTool: LineTool;
  let fixture: ComponentFixture<EditorComponent>;
  let colorsService: ColorsService;

  const mouseDown = (c: Coordinate = new Coordinate()): MouseEvent => {
    return {
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

  const dblClick = (c: Coordinate = new Coordinate()): MouseEvent => {
    return {
      type: 'dblclick',
      offsetX: c.x,
      offsetY: c.y,
    } as MouseEvent;
  };

  const keyUp = (key: string, shiftKey: boolean = false): KeyboardEvent => {
    return {
      key,
      type: 'keyup',
      shiftKey,
    } as KeyboardEvent;
  };

  const keyDown = (key: string, shiftKey: boolean = false): KeyboardEvent => {
    return {
      key,
      type: 'keydown',
      shiftKey,
    } as KeyboardEvent;
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditorComponent, DrawingSurfaceComponent, GridComponent],
      imports: [SharedModule, RouterTestingModule, ToolbarModule],
      providers: [EditorService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorComponent);
    fixture.detectChanges();
    colorsService = fixture.componentInstance.editorService.colorsService;
    lineTool = new LineTool(fixture.componentInstance.editorService);
    lineTool['shape'] = new CompositeLine();
  });

  it('should call removeLastPoint on backspace if isActive', () => {
    lineTool['isActive'] = true;
    const removeSpy = spyOn(lineTool.shape, 'removeLastPoint');
    lineTool.handleKeyboardEvent(keyDown('Backspace'));
    expect(removeSpy).toHaveBeenCalled();
  });

  it('should not call removeLastPoint on backspace if not isActive', () => {
    lineTool['isActive'] = false;
    const removeSpy = spyOn(lineTool.shape, 'removeLastPoint');
    lineTool.handleKeyboardEvent(keyDown('Backspace'));
    expect(removeSpy).not.toHaveBeenCalled();
  });

  it('should call cancelShape on escape if isActive', () => {
    lineTool['isActive'] = false;
    const cancelSpy = spyOn(lineTool, 'cancelShape');
    lineTool.handleKeyboardEvent(keyDown('Escape'));
    expect(cancelSpy).not.toHaveBeenCalled();
  });

  it('should not call cancelShape on escape if not isActive', () => {
    lineTool['isActive'] = false;
    const cancelSpy = spyOn(lineTool, 'cancelShape');
    lineTool.handleKeyboardEvent(keyDown('Escape'));
    expect(cancelSpy).not.toHaveBeenCalled();
  });

  it('should determine lock method and update on shift down', () => {
    const lockSpy = spyOn(lineTool, 'determineLockMethod').and.callThrough();
    const updateSpy = spyOn(lineTool.shape, 'updateCurrentCoord');
    lineTool.handleKeyboardEvent(keyDown('Shift', true));
    expect(lockSpy).toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalled();
  });

  it('should reset lock method and update on shift up', () => {
    const updateSpy = spyOn(lineTool.shape, 'updateCurrentCoord');
    lineTool.handleKeyboardEvent(keyUp('Shift'));
    expect(lineTool['lockMethod']).toEqual(lineTool['calculateNoLock']);
    expect(updateSpy).toHaveBeenCalled();
  });

  it('can create new line', () => {
    const drawSpy = spyOn(lineTool, 'addShape');
    lineTool.handleMouseEvent(mouseDown());
    expect(lineTool.shape).toBeTruthy();
    expect(lineTool.shape.secondaryColor).toEqual(colorsService.secondaryColor);
    expect(lineTool.shape.primaryColor).toEqual(colorsService.primaryColor);
    expect(lineTool.shape.strokeWidth).toEqual(lineTool['toolProperties'].strokeWidth.value);
    expect(drawSpy).toHaveBeenCalled();
  });

  it('can init line with junctions', () => {
    lineTool['toolProperties'].junctionType.value = LineJunctionType.POINTS;
    lineTool.handleMouseEvent(mouseDown());
    expect(lineTool.shape.thickness).toEqual(lineTool['toolProperties'].junctionDiameter.value);
  });

  it('can init line without junctions', () => {
    lineTool['toolProperties'].junctionType.value = LineJunctionType.EMPTY;
    lineTool.handleMouseEvent(mouseDown());
    expect(lineTool.shape.thickness).toEqual(0);
  });

  it('should call endLine on double click if isActive', () => {
    lineTool.handleMouseEvent(mouseDown());
    const endSpy = spyOn(lineTool.shape, 'endLine');
    lineTool['isActive'] = true;
    lineTool.handleMouseEvent(dblClick());
    expect(endSpy).toHaveBeenCalled();
  });

  it('should not endLine on double click if not isActive', () => {
    lineTool.handleMouseEvent(mouseDown());
    const endSpy = spyOn(lineTool.shape, 'endLine');
    lineTool['isActive'] = false;
    lineTool.handleMouseEvent(dblClick());
    expect(endSpy).not.toHaveBeenCalled();
  });

  it('should update current coordinate on mouseMove if isActive', () => {
    lineTool.handleMouseEvent(mouseDown());
    const updateSpy = spyOn(lineTool.shape, 'updateCurrentCoord');
    lineTool['isActive'] = true;
    lineTool.handleMouseEvent(mouseMove());
    expect(updateSpy).toHaveBeenCalled();
  });

  it('should confirm point on mouseDown if isActive', () => {
    lineTool.handleMouseEvent(mouseDown());
    const confirmSpy = spyOn(lineTool.shape, 'confirmPoint');
    lineTool['isActive'] = true;
    lineTool.handleMouseEvent(mouseDown());
    expect(confirmSpy).toHaveBeenCalled();
  });

  it('should create new shape on mouseDown if not isActive', () => {
    const createShapeSpy = spyOn(lineTool, 'createShape');
    lineTool['isActive'] = false;
    lineTool.handleMouseEvent(mouseDown());
    expect(createShapeSpy).toHaveBeenCalled();
  });

  it('can determine horizontal lock method', () => {
    lineTool.handleMouseEvent(mouseDown(new Coordinate(100, 100)));
    lineTool.handleMouseEvent(mouseMove(new Coordinate(200, 110)));
    expect(lineTool.determineLockMethod()).toEqual(lineTool['calculateHorizontalLock']);
  });

  it('can determine vertical lock method', () => {
    lineTool.handleMouseEvent(mouseDown(new Coordinate(100, 100)));
    lineTool.handleMouseEvent(mouseMove(new Coordinate(110, 2000)));
    expect(lineTool.determineLockMethod()).toEqual(lineTool['calculateVerticalLock']);
  });

  it('can determine positive diagonal lock method', () => {
    lineTool.handleMouseEvent(mouseDown(new Coordinate(100, 100)));
    lineTool.handleMouseEvent(mouseMove(new Coordinate(140, 160)));
    expect(lineTool.determineLockMethod()).toEqual(lineTool['calculatePositiveDiagonalLock']);
  });

  it('can determine negative diagonal lock method', () => {
    lineTool.handleMouseEvent(mouseDown(new Coordinate(100, 100)));
    lineTool.handleMouseEvent(mouseMove(new Coordinate(160, 50)));
    expect(lineTool.determineLockMethod()).toEqual(lineTool['calculateNegativeDiagonalLock']);
  });

  it('can determine no lock method', () => {
    lineTool['isActive'] = false;
    expect(lineTool.determineLockMethod()).toEqual(lineTool['calculateNoLock']);
  });

  it('can calculate horizontal lock', () => {
    lineTool.shape = new CompositeLine(new Coordinate(1, 2));
    const coord = new Coordinate(3, 4);
    const res = lineTool.calculateHorizontalLock(coord);

    expect(res.toString()).toEqual(new Coordinate(3, 2).toString());
  });

  it('can calculate vertical lock', () => {
    lineTool.shape = new CompositeLine(new Coordinate(1, 2));
    const coord = new Coordinate(3, 4);
    const res = lineTool.calculateVerticalLock(coord);

    expect(res.toString()).toEqual(new Coordinate(1, 4).toString());
  });

  it('can calculate positive diagonal lock', () => {
    lineTool.shape = new CompositeLine(new Coordinate(1, 2));
    const coord = new Coordinate(3, 4);
    const res = lineTool.calculatePositiveDiagonalLock(coord);

    expect(res.toString()).toEqual(new Coordinate(3, 4).toString());
  });

  it('can calculate negative diagonal lock', () => {
    lineTool.shape = new CompositeLine(new Coordinate(1, 2));
    const coord = new Coordinate(3, 4);
    const res = lineTool.calculateNegativeDiagonalLock(coord);

    expect(res.toString()).toEqual(new Coordinate(3, 0).toString());
  });
});
