/* tslint:disable:no-string-literal no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EditorModule } from '@components/pages/editor/editor.module';
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

  createShape(c: Coordinate): Path {
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
  let coordinate = new Coordinate(0, 0);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule, EditorModule],
      providers: [{ provide: EditorService, useClass: MockEditorService }],
    }).compileComponents();
  });

  beforeEach(() => {
    const editor = TestBed.inject(EditorService);
    editor.gameService.canDraw = true;
    penToolMock = new PenToolMock(editor);
  });

  it('should create', () => {
    expect(penToolMock).toBeTruthy();
  });

  it('returns a path on getShape', () => {
    const path = new Path(new Coordinate(1, 2));
    penToolMock['shape'] = path;

    expect(penToolMock.shape).toEqual(path);
  });

  it('should set active and initialize path on mouse down', () => {
    const addShapeSpy = spyOn(penToolMock, 'addShape');
    penToolMock.handleMouseEvent(mouseDown(new Coordinate(100, 100)));
    expect(addShapeSpy).toHaveBeenCalled();
    expect(penToolMock['isActive']).toEqual(true);
  });

  it('should apply shape on mouseup and mouseleave if tool is active', () => {
    penToolMock['shape'] = penToolMock.createShape(coordinate);
    penToolMock['isActive'] = true;
    const applyShapeSpy = spyOn(penToolMock, 'applyShape');
    penToolMock.handleMouseEvent(mouseUp());

    penToolMock['isActive'] = true;
    penToolMock.handleMouseEvent(mouseLeave());

    expect(applyShapeSpy).toHaveBeenCalledTimes(2);
  });

  it('should add point to shape on mousemove', () => {
    penToolMock['shape'] = penToolMock.createShape(coordinate);
    penToolMock['isActive'] = true;
    const addPointSpy = spyOn(penToolMock.shape, 'addPoint');
    const coord = new Coordinate(1, 2);

    penToolMock.handleMouseEvent(mouseMove(coord));

    expect(addPointSpy).toHaveBeenCalledWith(coord);
  });

  it('should ignore mouseup mouseleave mousemove if tool is not active', () => {
    penToolMock['shape'] = penToolMock.createShape(coordinate);
    penToolMock['isActive'] = true;
    const applyShapeSpy = spyOn(penToolMock, 'applyShape');
    const addPointSpy = spyOn(penToolMock.shape, 'addPoint');
    penToolMock['isActive'] = false;

    penToolMock.handleMouseEvent(mouseMove());
    penToolMock.handleMouseEvent(mouseLeave());
    penToolMock.handleMouseEvent(mouseUp());

    expect(addPointSpy).not.toHaveBeenCalled();
    expect(applyShapeSpy).not.toHaveBeenCalled();
  });
});
