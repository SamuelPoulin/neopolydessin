import { NumericProperty } from '@tool-properties/props/numeric-property/numeric-property';
import { ToolProperties } from '@tool-properties/tool-properties';

export abstract class CreatorToolProperties extends ToolProperties {
  strokeWidth: NumericProperty;

  protected constructor(minStrokeWidth: number, maxStrokeWidth: number) {
    super();
    this.strokeWidth = new NumericProperty(minStrokeWidth, maxStrokeWidth);
  }
}
