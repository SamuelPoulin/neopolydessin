import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@components/shared/shared.module';
import { EditorService } from '@services/editor.service';

import { EraserToolbarComponent } from 'src/app/components/pages/editor/toolbar/eraser-toolbar/eraser-toolbar.component';
import { ToolType } from 'src/app/models/tools/tool-type.enum';

describe('EraserToolbarComponent', () => {
  let component: EraserToolbarComponent;
  let fixture: ComponentFixture<EraserToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [EraserToolbarComponent],
      providers: [EditorService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EraserToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('can get toolProperties', () => {
    const editorService: EditorService = TestBed.get(EditorService);
    // @ts-ignore
    expect(component.toolProperties).toEqual(editorService.tools.get(ToolType.Eraser).toolProperties);
  });
});
