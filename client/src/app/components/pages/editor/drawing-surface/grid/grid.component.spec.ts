import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GridVisibility } from '@tool-properties/grid-properties/grid-visibility.enum';
import { GridComponent } from './grid.component';

describe('GridComponent', () => {
  let component: GridComponent;
  let fixture: ComponentFixture<GridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GridComponent],
    }).compileComponents();
  }));

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
