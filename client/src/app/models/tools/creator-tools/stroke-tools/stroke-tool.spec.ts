/* tslint:disable:no-string-literal no-magic-numbers */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DrawingSurfaceComponent } from '@components/pages/editor/drawing-surface/drawing-surface.component';
import { GridComponent } from '@components/pages/editor/drawing-surface/grid/grid.component';
import { EditorComponent } from '@components/pages/editor/editor/editor.component';
import { ToolbarModule } from '@components/pages/editor/toolbar/toolbar.module';
import { SharedModule } from '@components/shared/shared.module';
import { Path } from '@models/shapes/path';
import { EditorService } from '@services/editor.service';
import { Coordinate } from '@utils/math/coordinate';
import { StrokeTool } from './stroke-tool';

export class StrokeToolMock extends StrokeTool {
  constructor(editorService: EditorService) {
    super(editorService);
  }

  createShape(): Path {
    return new Path(new Coordinate());
  }
}

export const mouseDown = (c: Coordinate = new Coordinate()): MouseEvent => {
  return {
    type: 'mousedown',
    offsetX: c.x,
    offsetY: c.y,
  } as MouseEvent;
};

export const click = (c: Coordinate = new Coordinate()): MouseEvent => {
  return {
    type: 'click',
    offsetX: c.x,
    offsetY: c.y,
  } as MouseEvent;
};

export const mouseMove = (c: Coordinate = new Coordinate()): MouseEvent => {
  return {
    type: 'mousemove',
    offsetX: c.x,
    offsetY: c.y,
  } as MouseEvent;
};

export const mouseUp = (c: Coordinate = new Coordinate()): MouseEvent => {
  return {
    type: 'mouseup',
    offsetX: c.x,
    offsetY: c.y,
  } as MouseEvent;
};

export const mouseLeave = (): MouseEvent => {
  return {
    type: 'mouseleave',
  } as MouseEvent;
};

describe('StrokeTool', () => {
  let strokeToolMock: StrokeTool;
  let fixture: ComponentFixture<EditorComponent>;

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
    strokeToolMock = new StrokeToolMock(fixture.componentInstance.editorService);
  });
  it('should create', () => {
    expect(strokeToolMock).toBeTruthy();
  });

  it('returns a path on getShape', () => {
    const path = new Path(new Coordinate(1, 2));
    strokeToolMock['shape'] = path;

    expect(strokeToolMock.shape).toEqual(path);
  });

  it('should set active and initialize path on mouse down', () => {
    const addShapeSpy = spyOn(strokeToolMock, 'addShape');
    strokeToolMock.handleMouseEvent(mouseDown(new Coordinate(100, 100)));
    expect(addShapeSpy).toHaveBeenCalled();
    expect(strokeToolMock['isActive']).toEqual(true);
  });

  it('should apply shape on mouseup and mouseleave if tool is active', () => {
    strokeToolMock['shape'] = strokeToolMock.createShape();
    strokeToolMock['isActive'] = true;
    const applyShapeSpy = spyOn(strokeToolMock, 'applyShape');
    strokeToolMock.handleMouseEvent(mouseUp());

    strokeToolMock['isActive'] = true;
    strokeToolMock.handleMouseEvent(mouseLeave());

    expect(applyShapeSpy).toHaveBeenCalledTimes(2);
  });

  it('should add point to shape on mousemove', () => {
    strokeToolMock['shape'] = strokeToolMock.createShape();
    strokeToolMock['isActive'] = true;
    const addPointSpy = spyOn(strokeToolMock.shape, 'addPoint');
    const coord = new Coordinate(1, 2);

    strokeToolMock.handleMouseEvent(mouseMove(coord));

    expect(addPointSpy).toHaveBeenCalledWith(coord);
  });

  it('should ignore mouseup mouseleave mousemove if tool is not active', () => {
    strokeToolMock['shape'] = strokeToolMock.createShape();
    strokeToolMock['isActive'] = true;
    const applyShapeSpy = spyOn(strokeToolMock, 'applyShape');
    const addPointSpy = spyOn(strokeToolMock.shape, 'addPoint');
    strokeToolMock['isActive'] = false;

    strokeToolMock.handleMouseEvent(mouseMove());
    strokeToolMock.handleMouseEvent(mouseLeave());
    strokeToolMock.handleMouseEvent(mouseUp());

    expect(addPointSpy).not.toHaveBeenCalled();
    expect(applyShapeSpy).not.toHaveBeenCalled();
  });
});
