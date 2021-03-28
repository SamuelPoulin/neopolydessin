/* tslint:disable:no-string-literal no-magic-numbers */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EditorModule } from '@components/pages/editor/editor.module';
import { EditorComponent } from '@components/pages/editor/editor/editor.component';
import { SharedModule } from '@components/shared/shared.module';
import { Path } from '@models/shapes/path';
import { EditorService } from '@services/editor.service';
import { MockEditorService } from '@services/editor.service.spec';
import { Coordinate } from '@utils/math/coordinate';
import { PenTool } from './pen-tool';

export class PenToolMock extends PenTool {
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

describe('PenTool', () => {
  let penToolMock: PenTool;
  let fixture: ComponentFixture<EditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule, EditorModule],
      providers: [{ provide: EditorService, useClass: MockEditorService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorComponent);
    fixture.detectChanges();
    penToolMock = new PenToolMock(fixture.componentInstance.editorService);
  });

  it('should create', () => {
    expect(penToolMock).toBeTruthy();
  });

  it('returns a path on getShape', () => {
    const path = new Path(new Coordinate(1, 2));
    penToolMock['shape'] = path;

    expect(penToolMock.shape).toEqual(path);
  });

  // todo - enable when server
  /*it('should set active and initialize path on mouse down', () => {
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
  });*/
});
