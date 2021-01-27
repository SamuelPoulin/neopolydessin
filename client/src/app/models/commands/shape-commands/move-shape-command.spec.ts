/*tslint:disable:no-string-literal*/
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GridComponent } from '@components/pages/editor/drawing-surface/grid/grid.component';
import { ToolbarModule } from '@components/pages/editor/toolbar/toolbar.module';
import { DrawingSurfaceComponent } from 'src/app/components/pages/editor/drawing-surface/drawing-surface.component';
import { EditorComponent } from 'src/app/components/pages/editor/editor/editor.component';
import { SharedModule } from 'src/app/components/shared/shared.module';
import { EditorService } from 'src/app/services/editor.service';
import { Rectangle } from '../../shapes/rectangle';
import { MoveShapeCommand } from './move-shape-command';

describe('RemoveShapesCommand', () => {
  let fixture: ComponentFixture<EditorComponent>;
  let editor: EditorComponent;
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
  });

  it('should change coordinates', () => {
    const rectangle = new Rectangle();
    const command = new MoveShapeCommand([rectangle], editor.editorService);
    command.execute();
    command['shapes'].forEach((shape, index) => {
      expect(shape.origin.x).toEqual(command['shapeCoordinates'][index].x + command.delta.x);
      expect(shape.origin.y).toEqual(command['shapeCoordinates'][index].y + command.delta.y);
    });
  });
  it('should change coordinates to their origial origin', () => {
    const rectangle = new Rectangle();
    const command = new MoveShapeCommand([rectangle], editor.editorService);
    command.undo();
    command['shapes'].forEach((shape, index) => {
      expect(shape.origin.x).toEqual(command['shapeCoordinates'][index].x);
      expect(shape.origin.y).toEqual(command['shapeCoordinates'][index].y);
    });
  });
});
