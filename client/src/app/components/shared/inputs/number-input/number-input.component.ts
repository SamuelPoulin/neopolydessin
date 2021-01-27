import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';
import { CustomInputComponent } from '../custom-input/custom-input.component';

@Component({
  selector: 'app-number-input',
  templateUrl: '../custom-input/custom-input.component.html',
  styleUrls: ['../custom-input/custom-input.component.scss'],
})
export class NumberInputComponent extends CustomInputComponent implements OnInit {
  static readonly DEFAULT_PATTERN_ERROR_MESSAGE: string = 'Valeur doit être numérique';
  @Input()
  set numberValue(value: number) {
    this.value = value.toString();
  }

  get numberValue(): number {
    return +this.value;
  }

  @Input() allowDecimals: boolean;
  @Input() allowNegatives: boolean;
  @Input() min: number;
  @Input() max: number;

  @Output() numberValueChange: EventEmitter<number>;

  constructor() {
    super();
    this.allowDecimals = false;
    this.allowNegatives = false;
    this.numberValueChange = new EventEmitter<number>();
  }

  static makeRegexString(allowNegatives: boolean = false, allowDecimals: boolean = false): string {
    let regexString = allowNegatives ? '^-?' : '^';
    regexString += '([0-9]*';
    regexString += allowDecimals ? '.)?[0-9]*$' : ')$';
    return regexString;
  }

  ngOnInit(): void {
    this.format = (v: string): string => (+v).toString();
    this.stringToMatch = NumberInputComponent.makeRegexString(this.allowNegatives, this.allowDecimals);
    this.errorMessages.pattern = NumberInputComponent.DEFAULT_PATTERN_ERROR_MESSAGE;
    this.errorMessages.min = 'Valeur doit être plus grande ou égale à ' + this.min;
    this.errorMessages.max = 'Valeur doit être plus petite ou égale à ' + this.max;
    super.ngOnInit();
    this.valueChange.subscribe((value: string) => {
      this.numberValueChange.emit(+value);
    });
  }

  makeValidators(): ValidatorFn[] {
    const validators = super.makeValidators();
    if (this.min !== undefined) {
      validators.push(Validators.min(this.min));
    }
    if (this.max !== undefined) {
      validators.push(Validators.max(this.max));
    }

    return validators;
  }
}
