/* tslint:disable:no-magic-numbers */
import { NumericProperty } from 'src/app/models/tool-properties/props/numeric-property/numeric-property';

describe('NumericProperty', () => {
  let numericProperty: NumericProperty;

  beforeEach(() => {
    numericProperty = new NumericProperty(1, 10);
  });

  it('should create', () => {
    expect(numericProperty).toBeDefined();
    expect(numericProperty.value).toEqual(1);
  });

  it('should fit value between bounds', () => {
    numericProperty.value = 11;
    expect(numericProperty.value).toEqual(10);
    numericProperty.value = 0;
    expect(numericProperty.value).toEqual(1);
  });
});
