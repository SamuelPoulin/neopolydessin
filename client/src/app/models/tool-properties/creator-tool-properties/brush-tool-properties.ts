import { EnumProperty } from '@tool-properties/props/enum-property/enum-property';
import { BrushTextureType } from 'src/app/models/tool-properties/creator-tool-properties/brush-texture-type.enum';
import { CreatorToolProperties } from 'src/app/models/tool-properties/creator-tool-properties/creator-tool-properties';

export class BrushToolProperties extends CreatorToolProperties {
  static readonly MIN_THICKNESS: number = 1;
  static readonly MAX_THICKNESS: number = 50;
  texture: EnumProperty<BrushTextureType, BrushTextureType>;

  constructor(texture: BrushTextureType = BrushTextureType.TEXTURE_1) {
    super(BrushToolProperties.MIN_THICKNESS, BrushToolProperties.MAX_THICKNESS);
    this.texture = new EnumProperty(texture, BrushTextureType);
  }
}
