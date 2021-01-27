import { Property } from '@tool-properties/props/property';
import { MathUtils } from '@utils/math/math-utils';

export class NumericProperty implements Property<number> {
  // todo setter?
  private _value: number;
  minValue: number;
  maxValue: number;

  constructor(minValue: number, maxValue: number, value: number = minValue) {
    this._value = value;
    this.maxValue = maxValue;
    this.minValue = minValue;
  }

  get value(): number {
    return this._value;
  }

  set value(value: number) {
    this._value = MathUtils.fit(value, this.minValue, this.maxValue);
  }
}
