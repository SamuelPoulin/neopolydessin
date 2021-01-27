import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PenToolbarComponent } from 'src/app/components/pages/editor/toolbar/pen-toolbar/pen-toolbar.component';
import { SharedModule } from 'src/app/components/shared/shared.module';
import { ToolType } from 'src/app/models/tools/tool-type.enum';
import { EditorService } from 'src/app/services/editor.service';

describe('PenToolbarComponent', () => {
  let component: PenToolbarComponent;
  let fixture: ComponentFixture<PenToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [PenToolbarComponent],
      providers: [EditorService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PenToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('can get toolProperties', () => {
    const editorService: EditorService = TestBed.get(EditorService);
    // @ts-ignore
    expect(component.toolProperties).toEqual(editorService.tools.get(ToolType.Pen).toolProperties);
  });
});
