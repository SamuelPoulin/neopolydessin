/* tslint:disable:no-magic-numbers */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CustomInputComponent } from '@components/shared/inputs/custom-input/custom-input.component';
import { NumberInputComponent } from '@components/shared/inputs/number-input/number-input.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NumericProperty } from '@tool-properties/props/numeric-property/numeric-property';
import { NumericPropertyInputComponent } from './numeric-property-input.component';

describe('NumericPropertyInputComponent', () => {
  let component: NumericPropertyInputComponent;
  let fixture: ComponentFixture<NumericPropertyInputComponent>;
  let prop: NumericProperty;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          BrowserAnimationsModule,
          MatDialogModule,
          MatFormFieldModule,
          MatInputModule,
          FormsModule,
          ReactiveFormsModule,
          MatSliderModule,
        ],
        declarations: [NumericPropertyInputComponent, NumberInputComponent, CustomInputComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(NumericPropertyInputComponent);
    component = fixture.componentInstance;
    prop = new NumericProperty(1, 100);
    component.property = prop;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
