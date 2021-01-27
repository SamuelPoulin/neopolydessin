import { NumericProperty } from '@tool-properties/props/numeric-property/numeric-property';
import { ToolProperties } from '@tool-properties/tool-properties';

export class EraserToolProperties extends ToolProperties {
  static readonly MIN_SIZE: number = 3;
  static readonly MAX_SIZE: number = 100;
  static readonly DEFAULT_SIZE: number = 51;

  eraserSize: NumericProperty;

  constructor(eraserSize: number = EraserToolProperties.DEFAULT_SIZE) {
    super();
    this.eraserSize = new NumericProperty(EraserToolProperties.MIN_SIZE, EraserToolProperties.MAX_SIZE, eraserSize);
  }
}
