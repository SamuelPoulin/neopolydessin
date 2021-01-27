import { EnumProperty } from '@tool-properties/props/enum-property/enum-property';
import { ContourType } from 'src/app/models/tool-properties/creator-tool-properties/contour-type.enum';
import { CreatorToolProperties } from 'src/app/models/tool-properties/creator-tool-properties/creator-tool-properties';

export class ShapeToolProperties extends CreatorToolProperties {
  static readonly MIN_THICKNESS: number = 1;
  static readonly MAX_THICKNESS: number = 10;

  contourType: EnumProperty<ContourType, ContourType>;

  constructor(
    contourType: ContourType = ContourType.FILLED_CONTOUR,
    minThickness: number = ShapeToolProperties.MIN_THICKNESS,
    maxThickness: number = ShapeToolProperties.MAX_THICKNESS,
  ) {
    super(minThickness, maxThickness);
    this.contourType = new EnumProperty(contourType, ContourType);
  }
}
