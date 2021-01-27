import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from 'src/app/components/shared/shared.module';
import { ToolType } from 'src/app/models/tools/tool-type.enum';
import { EditorService } from '../../../../../services/editor.service';
import { PolygonToolbarComponent } from './polygon-toolbar.component';

describe('PolygonToolbarComponent', () => {
  let component: PolygonToolbarComponent;
  let fixture: ComponentFixture<PolygonToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [PolygonToolbarComponent],
      providers: [EditorService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolygonToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('can get toolProperties', () => {
    const editorService: EditorService = TestBed.get(EditorService);
    // @ts-ignore
    expect(component.toolProperties).toEqual(editorService.tools.get(ToolType.Polygon).toolProperties);
  });
});
