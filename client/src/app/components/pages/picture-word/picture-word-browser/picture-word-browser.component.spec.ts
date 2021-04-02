import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PictureWordBrowserComponent } from './picture-word-browser.component';

describe('PictureWordBrowserComponent', () => {
  let component: PictureWordBrowserComponent;
  let fixture: ComponentFixture<PictureWordBrowserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PictureWordBrowserComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PictureWordBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
