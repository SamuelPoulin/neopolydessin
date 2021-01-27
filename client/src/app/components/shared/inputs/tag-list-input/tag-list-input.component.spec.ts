import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CustomInputComponent } from 'src/app/components/shared/inputs/custom-input/custom-input.component';
import { TagListInputComponent } from './tag-list-input.component';

describe('TagListInputComponent', () => {
  let component: TagListInputComponent;
  let fixture: ComponentFixture<TagListInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, MatDialogModule, MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule],
      declarations: [TagListInputComponent, CustomInputComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagListInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
