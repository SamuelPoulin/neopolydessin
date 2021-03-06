import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SharedModule } from '@components/shared/shared.module';
import { EditorService } from '@services/editor.service';
import { MockEditorService } from '@services/editor.service.spec';

import { GridToolbarComponent } from './grid-toolbar.component';

describe('GridToolbarComponent', () => {
  let component: GridToolbarComponent;
  let fixture: ComponentFixture<GridToolbarComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [SharedModule],
        declarations: [GridToolbarComponent],
        providers: [{ provide: EditorService, useClass: MockEditorService }],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(GridToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
