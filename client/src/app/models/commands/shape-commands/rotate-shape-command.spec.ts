/*tslint:disable:no-string-literal*/
/*tslint:disable:no-magic-numbers*/
/* tslint:disable:no-any */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DrawingSurfaceComponent } from '@components/pages/editor/drawing-surface/drawing-surface.component';
import { GridComponent } from '@components/pages/editor/drawing-surface/grid/grid.component';
import { EditorComponent } from '@components/pages/editor/editor/editor.component';
import { ToolbarModule } from '@components/pages/editor/toolbar/toolbar.module';
import { SharedModule } from '@components/shared/shared.module';
import { BaseShape } from '@models/shapes/base-shape';
import { Ellipse } from '@models/shapes/ellipse';
import { Rectangle } from '@models/shapes/rectangle';
import { EditorService } from '@services/editor.service';
import { Coordinate } from '@utils/math/coordinate';
import { RotateShapeCommand } from './rotate-shape-command';

describe('RotateShapeCommand', () => {
  let fixture: ComponentFixture<EditorComponent>;
  let editor: EditorComponent;
  let shapes: BaseShape[];

  beforeEach(async(() => {
      TestBed.configureTestingModule({
      imports: [RouterTestingModule, SharedModule, ToolbarModule],
      declarations: [DrawingSurfaceComponent, EditorComponent, GridComponent],
      providers: [EditorService],
      }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorComponent);
    fixture.detectChanges();
    editor = fixture.componentInstance;

    shapes = [
      new Rectangle(new Coordinate(0, 50), 50, 50),
      new Ellipse(new Coordinate(100, 50), 40, 30)
    ];

  });

  it('can apply individual rotation', () => {
    const angle = 30;
    const command = new RotateShapeCommand(shapes, editor.editorService, angle);
    command.execute();
    shapes.forEach((shape) => {
      expect(shape.rotation).toEqual(angle);
    });
  });

  it('can apply multiple rotation', () => {
    const angle = 30;
    const command = new RotateShapeCommand(shapes, editor.editorService, angle, new Coordinate());
    const offsetSpy = spyOn<any>(command, 'applyRotationOffset');
    command.execute();
    expect(offsetSpy).toHaveBeenCalledTimes(shapes.length);
  });

  it('can undo rotation', () => {
    const angle = 30;
    const command = new RotateShapeCommand(shapes, editor.editorService, angle);
    command.execute();
    command.undo();
    shapes.forEach((shape) => {
      expect(shape.rotation).toEqual(0);
    });
  });

  it('can apply offset rotation', () => {
    const angle = 45;
    const origin = new Coordinate(50, 50);
    const shape = shapes[0];
    const newCenter = shape.center.rotate(angle, origin);
    const command = new RotateShapeCommand(shape, editor.editorService, angle, origin);
    command.execute();
    expect(shape.center).toEqual(newCenter);
    expect(shape.rotation).toEqual(angle);
  });

});
