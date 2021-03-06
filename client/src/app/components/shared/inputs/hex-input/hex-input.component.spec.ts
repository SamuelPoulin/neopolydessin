import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CustomInputComponent } from 'src/app/components/shared/inputs/custom-input/custom-input.component';

import { HexInputComponent } from 'src/app/components/shared/inputs/hex-input/hex-input.component';

describe('HexInputComponent', () => {
  let component: HexInputComponent;
  let fixture: ComponentFixture<HexInputComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [BrowserAnimationsModule, MatDialogModule, MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule],
        declarations: [HexInputComponent, CustomInputComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(HexInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('can format hex string', () => {
    expect(component.format('0aFb0')).toEqual('0afb0');
  });
});
