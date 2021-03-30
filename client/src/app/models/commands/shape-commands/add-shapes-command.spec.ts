/*tslint:disable:no-string-literal*/
import { async, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GridComponent } from '@components/pages/editor/drawing-surface/grid/grid.component';
import { ToolbarModule } from '@components/pages/editor/toolbar/toolbar.module';
import { EditorService } from '@services/editor.service';
import { MockEditorService } from '@services/editor.service.spec';
import { DrawingSurfaceComponent } from 'src/app/components/pages/editor/drawing-surface/drawing-surface.component';
import { EditorComponent } from 'src/app/components/pages/editor/editor/editor.component';
import { SharedModule } from 'src/app/components/shared/shared.module';
import { AddShapesCommand } from 'src/app/models/commands/shape-commands/add-shapes-command';
import { Rectangle } from '../../shapes/rectangle';

describe('AddShapesCommand', () => {
  let service: EditorService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, SharedModule, ToolbarModule],
      declarations: [DrawingSurfaceComponent, EditorComponent, GridComponent],
      providers: [{ provide: EditorService, useClass: MockEditorService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    service = TestBed.inject(EditorService);
  });

  it('should add shape to buffer then apply buffer', () => {
    const shape = new Rectangle();
    const command = new AddShapesCommand([shape], service);
    const addSpy = spyOn(service, 'addShapeToBuffer');
    const applySpy = spyOn(service, 'applyShapesBuffer');
    command.execute();
    expect(addSpy).toHaveBeenCalled();
    expect(applySpy).toHaveBeenCalled();
  });

  it('should remove shape on undo', () => {
    const shape = new Rectangle();
    const command = new AddShapesCommand([shape], service);
    const removeSpy = spyOn(service, 'removeShapes');
    command.execute();
    command.undo();
    expect(removeSpy).toHaveBeenCalledWith([shape]);
  });
});
