/*tslint:disable:no-string-literal*/
import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EditorModule } from '@components/pages/editor/editor.module';
import { MockEditorService } from '@services/editor.service.spec';
import { SharedModule } from 'src/app/components/shared/shared.module';
import { RemoveShapesCommand } from 'src/app/models/commands/shape-commands/remove-shapes-command';
import { EditorService } from 'src/app/services/editor.service';
import { Rectangle } from '../../shapes/rectangle';

describe('RemoveShapesCommand', () => {
  let service: EditorService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [RouterTestingModule, SharedModule, EditorModule],
        providers: [{ provide: EditorService, useClass: MockEditorService }],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    service = TestBed.inject(EditorService);
  });

  it('should add back shape to buffer then apply buffer', () => {
    const shape = new Rectangle();
    const command = new RemoveShapesCommand([shape], service);
    const addSpy = spyOn(service, 'addShapeToBuffer');
    const applySpy = spyOn(service, 'applyShapesBuffer');
    command.undo();
    expect(addSpy).toHaveBeenCalled();
    expect(applySpy).toHaveBeenCalled();
  });

  it('can remove shape', () => {
    const shape = new Rectangle();
    const command = new RemoveShapesCommand([shape], service);
    const removeSpy = spyOn(service, 'removeShapes');
    service.addShapeToBuffer(shape);
    service.applyShapesBuffer();
    command.execute();
    expect(removeSpy).toHaveBeenCalledWith([shape]);
  });
});
