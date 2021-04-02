import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PictureWordUploadComponent } from './picture-word-upload.component';

describe('PictureWordUploadComponent', () => {
  let component: PictureWordUploadComponent;
  let fixture: ComponentFixture<PictureWordUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PictureWordUploadComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PictureWordUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
