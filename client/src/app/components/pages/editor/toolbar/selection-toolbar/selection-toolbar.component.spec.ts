import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@components/shared/shared.module';
import { EditorService } from '@services/editor.service';
import { SelectionToolbarComponent } from './selection-toolbar.component';

describe('SelectionToolbarComponent', () => {
  let component: SelectionToolbarComponent;
  let fixture: ComponentFixture<SelectionToolbarComponent>;
  let editorService: EditorService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [SelectionToolbarComponent],
      providers: [EditorService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectionToolbarComponent);
    component = fixture.componentInstance;
    editorService = TestBed.get(EditorService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should call copySelectedShapes from EditorService', () => {
    const copySpy = spyOn(editorService, 'copySelectedShapes');
    component.copy();
    expect(copySpy).toHaveBeenCalled();
  });
  it('should call cutSelectedShapes from EditorService', () => {
    const cutSpy = spyOn(editorService, 'cutSelectedShapes');
    component.cut();
    expect(cutSpy).toHaveBeenCalled();
  });
  it('should call duplicateSelectedShapes from EditorService', () => {
    const duplicationSpy = spyOn(editorService, 'duplicateSelectedShapes');
    component.duplicate();
    expect(duplicationSpy).toHaveBeenCalled();
  });
  it('should call pasteClipboard from EditorService', () => {
    const pasteSpy = spyOn(editorService, 'pasteClipboard');
    component.paste();
    expect(pasteSpy).toHaveBeenCalled();
  });
  it('should call deleteSelectedShapes from EditorService', () => {
    const deleteSpy = spyOn(editorService, 'deleteSelectedShapes');
    component.delete();
    expect(deleteSpy).toHaveBeenCalled();
  });
  it('should call selectAll from EditorService', () => {
    const selectAllSpy = spyOn(editorService, 'selectAll');
    component.selectAll();
    expect(selectAllSpy).toHaveBeenCalled();
  });
});
