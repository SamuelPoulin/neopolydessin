/*tslint:disable:no-string-literal*/
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GridComponent } from '@components/pages/editor/drawing-surface/grid/grid.component';
import { ToolbarModule } from '@components/pages/editor/toolbar/toolbar.module';
import { CopyShapeCommand } from '@models/commands/shape-commands/copy-shape-command';
import { DrawingSurfaceComponent } from 'src/app/components/pages/editor/drawing-surface/drawing-surface.component';
import { EditorComponent } from 'src/app/components/pages/editor/editor/editor.component';
import { SharedModule } from 'src/app/components/shared/shared.module';
import { EditorService } from 'src/app/services/editor.service';
import { Rectangle } from '../../shapes/rectangle';

describe('CopyShapeCommand', () => {
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

  it('should update offset on execute', () => {
    const shape = new Rectangle();
    const command = new CopyShapeCommand([shape], editor.editorService);
    const copieSpy = spyOn(editor.editorService, 'updateShapeOffset');
    command.execute();
    expect(copieSpy).toHaveBeenCalledWith(true);
  });

  it('should update offset on undo', () => {
    const shape = new Rectangle();
    const command = new CopyShapeCommand([shape], editor.editorService);
    const copieSpy = spyOn(editor.editorService, 'updateShapeOffset');
    command.undo();
    expect(copieSpy).toHaveBeenCalledWith(false);
  });
});
