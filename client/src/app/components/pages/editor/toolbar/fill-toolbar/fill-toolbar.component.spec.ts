import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FillToolbarComponent } from '@components/pages/editor/toolbar/fill-toolbar/fill-toolbar.component';
import { SharedModule } from 'src/app/components/shared/shared.module';
import { ToolType } from 'src/app/models/tools/tool-type.enum';
import { EditorService } from 'src/app/services/editor.service';

describe('FillToolbarComponent', () => {
  let component: FillToolbarComponent;
  let fixture: ComponentFixture<FillToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [FillToolbarComponent],
      providers: [EditorService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FillToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('can get toolProperties', () => {
    const editorService: EditorService = TestBed.get(EditorService);
    // @ts-ignore
    expect(component.toolProperties).toEqual(editorService.tools.get(ToolType.ColorFill).toolProperties);
  });
});
