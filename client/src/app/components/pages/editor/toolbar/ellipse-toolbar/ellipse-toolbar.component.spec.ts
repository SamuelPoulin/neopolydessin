import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ToolType } from 'src/app/models/tools/tool-type.enum';
import { SharedModule } from '../../../../shared/shared.module';

import { EditorService } from '../../../../../services/editor.service';
import { EllipseToolbarComponent } from './ellipse-toolbar.component';

describe('EllipseToolbarComponent', () => {
  let component: EllipseToolbarComponent;
  let fixture: ComponentFixture<EllipseToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [EllipseToolbarComponent],
      providers: [EditorService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EllipseToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('can get toolProperties', () => {
    const editorService: EditorService = TestBed.get(EditorService);
    // @ts-ignore
    expect(component.toolProperties).toEqual(editorService.tools.get(ToolType.Ellipse).toolProperties);
  });
});
