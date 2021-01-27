/* tslint:disable:no-string-literal no-magic-numbers */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DrawingSurfaceComponent } from '@components/pages/editor/drawing-surface/drawing-surface.component';
import { GridComponent } from '@components/pages/editor/drawing-surface/grid/grid.component';
import { ToolbarModule } from '@components/pages/editor/toolbar/toolbar.module';
import { Rectangle } from '@models/shapes/rectangle';
import { Coordinate } from '@utils/math/coordinate';
import { EditorComponent } from 'src/app/components/pages/editor/editor/editor.component';
import { keyDown, keyUp } from 'src/app/components/pages/editor/editor/editor.component.spec';
import { SharedModule } from 'src/app/components/shared/shared.module';
import { EditorService } from 'src/app/services/editor.service';
import { ShapeTool } from './shape-tool';

export class MockShapeTool extends ShapeTool {
  shape: Rectangle;

  constructor(editorService: EditorService) {
    super(editorService);
  }

  createShape(): Rectangle {
    return new Rectangle();
  }

  resizeShape(origin: Coordinate, dimensions: Coordinate): void {
    return;
  }

  protected updateProperties(): void {
    return;
  }
}

describe('ShapeTool', () => {
  let mockShapeTool: ShapeTool;
  let fixture: ComponentFixture<EditorComponent>;
  let surface: DrawingSurfaceComponent;

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

  const mouseUp = (c: Coordinate = new Coordinate()): MouseEvent => {
    return {
      type: 'mouseup',
      offsetX: c.x,
      offsetY: c.y,
    } as MouseEvent;
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
    surface = fixture.componentInstance.drawingSurface;
    mockShapeTool = new MockShapeTool(fixture.componentInstance.editorService);
  });

  it('should create', () => {
    expect(mockShapeTool).toBeTruthy();
  });

  it('can draw preview area', () => {
    mockShapeTool.handleMouseEvent(mouseDown());
    expect(surface.svg.querySelector('rect')).toBeTruthy();
  });

  it('can remove preview area', () => {
    mockShapeTool.handleMouseEvent(mouseDown());
    expect(mockShapeTool['editorService']['previewShapes'].length).not.toEqual(0);
    mockShapeTool.handleMouseEvent(mouseUp());
    expect(mockShapeTool['editorService']['previewShapes'].length).toEqual(0);
  });

  it('can update preview rectangle', () => {
    mockShapeTool.handleMouseEvent(mouseDown(new Coordinate(100, 100)));
    mockShapeTool.handleMouseEvent(mouseMove(new Coordinate(250, 200)));
    expect(mockShapeTool['previewArea'].svgNode.getAttribute('width')).toEqual('150');
    expect(mockShapeTool['previewArea'].svgNode.getAttribute('height')).toEqual('100');
  });

  it('can update current shape size', () => {
    const resizeShapeSpy = spyOn(mockShapeTool, 'resizeShape');
    mockShapeTool.handleMouseEvent(mouseDown(new Coordinate(100, 100)));
    mockShapeTool.handleMouseEvent(mouseMove(new Coordinate(250, 200)));
    expect(resizeShapeSpy).toHaveBeenCalledWith(new Coordinate(150, 100), new Coordinate(100, 100));
  });

  it('can set equal dimensions on shift down', () => {
    const resizeShapeSpy = spyOn(mockShapeTool, 'resizeShape');
    mockShapeTool.handleMouseEvent(mouseDown(new Coordinate(100, 100)));
    mockShapeTool.handleMouseEvent(mouseMove(new Coordinate(250, 200)));
    resizeShapeSpy.calls.reset();
    mockShapeTool.handleKeyboardEvent(keyDown('Shift', true));
    expect(resizeShapeSpy).toHaveBeenCalledWith(new Coordinate(100, 100), new Coordinate(100, 100));
  });

  it('can keep correct origin on shift down', () => {
    const resizeShapeSpy = spyOn(mockShapeTool, 'resizeShape');
    mockShapeTool.handleMouseEvent(mouseDown(new Coordinate(200, 200)));
    mockShapeTool.handleKeyboardEvent(keyDown('Shift', true));
    mockShapeTool.handleMouseEvent(mouseMove(new Coordinate(50, 100)));
    expect(resizeShapeSpy).toHaveBeenCalledWith(new Coordinate(100, 100), new Coordinate(100, 100));
  });

  it('can reset full dimensions on shift up', () => {
    const resizeShapeSpy = spyOn(mockShapeTool, 'resizeShape');
    mockShapeTool.handleMouseEvent(mouseDown(new Coordinate(100, 100)));
    mockShapeTool.handleMouseEvent(mouseMove(new Coordinate(250, 200)));
    resizeShapeSpy.calls.reset();
    mockShapeTool.handleKeyboardEvent(keyDown('Shift', true));
    resizeShapeSpy.calls.reset();
    mockShapeTool.handleKeyboardEvent(keyUp('Shift', false));
    expect(resizeShapeSpy).toHaveBeenCalledWith(new Coordinate(150, 100), new Coordinate(100, 100));
  });

  it('does not update current coordinate on shift if not active', () => {
    const updateCurrentCoordSpy = spyOn(mockShapeTool, 'updateCurrentCoord');
    mockShapeTool.handleKeyboardEvent(keyDown('Shift', true));
    mockShapeTool.handleKeyboardEvent(keyDown('Shift', false));
    expect(updateCurrentCoordSpy).not.toHaveBeenCalled();
  });

  it('does not update current coordinate on mousedown if active', () => {
    const updateCurrentCoordSpy = spyOn(mockShapeTool, 'updateCurrentCoord');
    mockShapeTool.handleMouseEvent(mouseDown(new Coordinate(100, 100)));
    mockShapeTool.handleMouseEvent(mouseMove(new Coordinate(250, 200)));
    updateCurrentCoordSpy.calls.reset();
    mockShapeTool.handleMouseEvent(mouseDown(new Coordinate(400, 400)));
    expect(updateCurrentCoordSpy).not.toHaveBeenCalled();
  });

  it('does not update current coordinate on mousedown if not active', () => {
    const updateCurrentCoordSpy = spyOn(mockShapeTool, 'updateCurrentCoord');
    mockShapeTool.handleMouseEvent(mouseDown(new Coordinate(100, 100)));
    mockShapeTool.handleMouseEvent(mouseMove(new Coordinate(250, 200)));
    updateCurrentCoordSpy.calls.reset();
    mockShapeTool['isActive'] = false;
    mockShapeTool.handleMouseEvent(mouseMove(new Coordinate(400, 400)));
    expect(updateCurrentCoordSpy).not.toHaveBeenCalled();
  });
});
