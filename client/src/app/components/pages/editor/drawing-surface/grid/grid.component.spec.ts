import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { EditorService } from '@services/editor.service';
import { MockEditorService } from '@services/editor.service.spec';

import { GridVisibility } from '@tool-properties/grid-properties/grid-visibility.enum';
import { GridComponent } from './grid.component';

describe('GridComponent', () => {
  let component: GridComponent;
  let fixture: ComponentFixture<GridComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [GridComponent],
        providers: [{ provide: EditorService, useClass: MockEditorService }],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(GridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return opacity 0 if not visible', () => {
    component.properties.visibility.value = GridVisibility.hidden;
    expect(component.opacity).toEqual(0);
  });
});
