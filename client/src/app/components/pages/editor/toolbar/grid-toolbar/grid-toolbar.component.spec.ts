import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '@components/shared/shared.module';
import { EditorService } from '@services/editor.service';

import { GridToolbarComponent } from './grid-toolbar.component';

describe('GridToolbarComponent', () => {
  let component: GridToolbarComponent;
  let fixture: ComponentFixture<GridToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [GridToolbarComponent],
      providers: [EditorService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
