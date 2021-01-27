import { NumericProperty } from '@tool-properties/props/numeric-property/numeric-property';
import { ToolProperties } from '@tool-properties/tool-properties';

export class FillToolProperties extends ToolProperties {
  static readonly TOLERANCE_MAX: number = 100;
  tolerance: NumericProperty;

  constructor() {
    super();
    this.tolerance = new NumericProperty(0, FillToolProperties.TOLERANCE_MAX);
  }
}
