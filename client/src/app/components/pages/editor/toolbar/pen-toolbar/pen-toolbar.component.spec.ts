import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MockEditorService } from '@services/editor.service.spec';

import { PenToolbarComponent } from 'src/app/components/pages/editor/toolbar/pen-toolbar/pen-toolbar.component';
import { SharedModule } from 'src/app/components/shared/shared.module';
import { ToolType } from 'src/app/models/tools/tool-type.enum';
import { EditorService } from 'src/app/services/editor.service';

describe('PenToolbarComponent', () => {
  let component: PenToolbarComponent;
  let fixture: ComponentFixture<PenToolbarComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [SharedModule],
        declarations: [PenToolbarComponent],
        providers: [{ provide: EditorService, useClass: MockEditorService }],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(PenToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('can get toolProperties', () => {
    const editorService: EditorService = TestBed.inject(EditorService);
    // @ts-ignore
    expect(component.toolProperties).toEqual(editorService.tools.get(ToolType.Pen).toolProperties);
  });
});
