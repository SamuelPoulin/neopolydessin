import { NumericProperty } from '@tool-properties/props/numeric-property/numeric-property';
import { CreatorToolProperties } from 'src/app/models/tool-properties/creator-tool-properties/creator-tool-properties';

export class SprayToolProperties extends CreatorToolProperties {
  static readonly MIN_SPRAY_RADIUS: number = 10;
  static readonly MAX_SPRAY_RADIUS: number = 50;
  static readonly MIN_SPRAY_FREQUENCY: number = 1;
  static readonly MAX_SPRAY_FREQUENCY: number = 50;
  frequency: NumericProperty;

  constructor() {
    super(SprayToolProperties.MIN_SPRAY_RADIUS, SprayToolProperties.MAX_SPRAY_RADIUS);
    this.frequency = new NumericProperty(SprayToolProperties.MIN_SPRAY_FREQUENCY, SprayToolProperties.MAX_SPRAY_FREQUENCY);
  }
}
