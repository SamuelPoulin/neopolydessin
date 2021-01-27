import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrushToolbarComponent } from 'src/app/components/pages/editor/toolbar/brush-toolbar/brush-toolbar.component';
import { SharedModule } from 'src/app/components/shared/shared.module';
import { ToolType } from 'src/app/models/tools/tool-type.enum';
import { EditorService } from 'src/app/services/editor.service';

describe('BrushToolbarComponent', () => {
  let component: BrushToolbarComponent;
  let fixture: ComponentFixture<BrushToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [BrushToolbarComponent],
      providers: [EditorService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrushToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('can get toolProperties', () => {
    const editorService: EditorService = TestBed.get(EditorService);
    // @ts-ignore
    expect(component.toolProperties).toEqual(editorService.tools.get(ToolType.Brush).toolProperties);
  });
});
