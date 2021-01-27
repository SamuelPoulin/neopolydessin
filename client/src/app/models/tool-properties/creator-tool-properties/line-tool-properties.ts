import { EnumProperty } from '@tool-properties/props/enum-property/enum-property';
import { NumericProperty } from '@tool-properties/props/numeric-property/numeric-property';
import { CreatorToolProperties } from 'src/app/models/tool-properties/creator-tool-properties/creator-tool-properties';
import { LineJunctionType } from 'src/app/models/tool-properties/creator-tool-properties/line-junction-type.enum';

export class LineToolProperties extends CreatorToolProperties {
  static readonly MIN_THICKNESS: number = 1;
  static readonly MAX_THICKNESS: number = 50;
  static readonly MIN_DIAMETER: number = 1;
  static readonly MAX_DIAMETER: number = 50;

  junctionDiameter: NumericProperty;
  junctionType: EnumProperty<LineJunctionType, LineJunctionType>;

  constructor(
    junctionType: LineJunctionType = LineJunctionType.POINTS,
  ) {
    super(LineToolProperties.MIN_THICKNESS, LineToolProperties.MAX_THICKNESS);
    this.junctionDiameter = new NumericProperty(LineToolProperties.MIN_DIAMETER, LineToolProperties.MAX_DIAMETER);

    this.junctionType = new EnumProperty(junctionType, LineJunctionType);
  }
}
