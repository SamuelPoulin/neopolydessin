import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportDrawingComponent } from './export-drawing.component';

describe('ExportDrawingComponent', () => {
  let component: ExportDrawingComponent;
  let fixture: ComponentFixture<ExportDrawingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExportDrawingComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportDrawingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
