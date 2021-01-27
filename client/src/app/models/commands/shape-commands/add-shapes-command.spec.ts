/*tslint:disable:no-string-literal*/
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GridComponent } from '@components/pages/editor/drawing-surface/grid/grid.component';
import { ToolbarModule } from '@components/pages/editor/toolbar/toolbar.module';
import { DrawingSurfaceComponent } from 'src/app/components/pages/editor/drawing-surface/drawing-surface.component';
import { EditorComponent } from 'src/app/components/pages/editor/editor/editor.component';
import { SharedModule } from 'src/app/components/shared/shared.module';
import { AddShapesCommand } from 'src/app/models/commands/shape-commands/add-shapes-command';
import { EditorService } from 'src/app/services/editor.service';
import { Rectangle } from '../../shapes/rectangle';

describe('AddShapesCommand', () => {
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

  it('should add shape to buffer then apply buffer', () => {
    const shape = new Rectangle();
    const command = new AddShapesCommand([shape], editor.editorService);
    const addSpy = spyOn(editor.editorService, 'addShapeToBuffer');
    const applySpy = spyOn(editor.editorService, 'applyShapesBuffer');
    command.execute();
    expect(addSpy).toHaveBeenCalled();
    expect(applySpy).toHaveBeenCalled();
  });

  it('should remove shape on undo', () => {
    const shape = new Rectangle();
    const command = new AddShapesCommand([shape], editor.editorService);
    const removeSpy = spyOn(editor.editorService, 'removeShapes');
    command.execute();
    command.undo();
    expect(removeSpy).toHaveBeenCalledWith([shape]);
  });
});
