/* tslint:disable:no-magic-numbers */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CustomInputComponent } from '@components/shared/inputs/custom-input/custom-input.component';

import { NumberInputComponent } from './number-input.component';

describe('NumberInputComponent', () => {
  let component: NumberInputComponent;
  let fixture: ComponentFixture<NumberInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, MatDialogModule, MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule],
      declarations: [NumberInputComponent, CustomInputComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NumberInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('can make regex string', () => {
    expect(NumberInputComponent.makeRegexString(false, false)).toEqual('^([0-9]*)$');
    expect(NumberInputComponent.makeRegexString(true, false)).toEqual('^-?([0-9]*)$');
    expect(NumberInputComponent.makeRegexString(false, true)).toEqual('^([0-9]*.)?[0-9]*$');
    expect(NumberInputComponent.makeRegexString(true, true)).toEqual('^-?([0-9]*.)?[0-9]*$');
  });

  it('should emit numberValueChange on valueChange event', () => {
    const numberValueChangeSpy = spyOn(component.numberValueChange, 'emit');

    component.valueChange.emit('4');
    fixture.detectChanges();
    expect(numberValueChangeSpy).toHaveBeenCalledWith(4);
  });

  it('can get number value', () => {
    component.value = '-3.2';
    expect(component.numberValue).toEqual(-3.2);
  });
});
