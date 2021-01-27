import { Component, EventEmitter, Input, NgIterable, OnChanges, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { defaultErrorMessages, ErrorMessages } from 'src/app/components/shared/inputs/error-messages';

@Component({
  selector: 'app-custom-input',
  templateUrl: './custom-input.component.html',
  styleUrls: ['./custom-input.component.scss'],
})
export class CustomInputComponent implements OnInit, OnChanges {
  // tslint:disable-next-line:typedef
  static id = 0;
  @Input() id: string;
  @Input() autofocus: boolean;
  @Input() formGroup: FormGroup;
  @Input() stringToMatch: string;
  @Input() required: boolean;
  @Input() messages: string;
  @Input() length: number;
  @Input() minLength: number;
  @Input() maxLength: number;
  @Input() prefix: string;
  @Input() suffix: string;
  @Input() allowExternalUpdatesWhenFocused: boolean;
  @Input() hintLabel: string;

  formControl: FormControl;

  private _focused: boolean;
  editingValue: string;
  validValue: string;

  @Input() value: string;
  @Output() valueChange: EventEmitter<string>;

  @Input() errorMessages: ErrorMessages<string>;
  @Input() format: (v: string) => string;

  constructor() {
    this.editingValue = '';
    this.validValue = '';
    this.value = '';
    this.valueChange = new EventEmitter<string>();
    this.errorMessages = defaultErrorMessages();
    this.id = `custom-input-${CustomInputComponent.id++}`;
    this.autofocus = true;
    this.formGroup = new FormGroup({});
    this.required = true;
    this.allowExternalUpdatesWhenFocused = false;
    this.hintLabel = '';
    this._focused = false;
    this.format = (v: string) => v;
  }

  ngOnInit(): void {
    if (!this.formControl) {
      this.formControl = new FormControl(this.value, this.makeValidators());
    }
    this.formGroup.addControl(this.id, this.formControl);
    this.value = this.format(this.value);
    this.validValue = this.value;
  }

  onFocus(): void {
    this._focused = true;
  }

  onBlur(value: string = ''): void {
    this._focused = false;
    if (this.formControl) {
      this.value = this.format(this.formControl.valid ? value : this.validValue);
      this.formControl.setValue(this.value);
      this.validValue = this.value;
      this.editingValue = this.value;
      this.valueChange.emit(this.value);
    }
  }

  onChange(value: string = ''): void {
    const shouldUpdate = this.formControl && this.formControl.valid;
    if (shouldUpdate) {
      this.value = value;
      this.editingValue = this.value;
      this.validValue = this.value;
      this.valueChange.emit(this.value);
    }
  }

  ngOnChanges(): void {
    const shouldUpdateValidValue = this.allowExternalUpdatesWhenFocused || !this.focused;

    this.value = shouldUpdateValidValue ? this.format(this.value) : this.editingValue;
    this.validValue = shouldUpdateValidValue ? this.value : this.validValue;
  }

  getErrorMessage(errorName: string): string {
    return this.errorMessages[errorName] || '';
  }

  makeValidators(): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    const minOrMaxLengthIsDefined = this.minLength || this.maxLength;
    if (!minOrMaxLengthIsDefined) {
      this.minLength = this.length;
      this.maxLength = this.length;
    }
    if (this.required) {
      validators.push(Validators.required);
    }
    if (this.stringToMatch) {
      validators.push(Validators.pattern(this.stringToMatch));
    }
    if (this.maxLength) {
      validators.push(Validators.maxLength(this.maxLength));
    }
    if (this.minLength) {
      validators.push(Validators.minLength(this.minLength));
    }
    return validators;
  }

  get errors(): NgIterable<string> {
    const errors: ValidationErrors | null = this.formControl.errors;
    return errors ? Object.keys(errors) : [];
  }

  get focused(): boolean {
    return this._focused;
  }

  get invalid(): boolean {
    const dirty = this.formControl.dirty || this.formControl.touched;
    return !!this.formControl.errors && this.formControl.invalid && dirty;
  }
}
