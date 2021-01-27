import { BrushTextureType } from 'src/app/models/tool-properties/creator-tool-properties/brush-texture-type.enum';
import { BrushToolProperties } from 'src/app/models/tool-properties/creator-tool-properties/brush-tool-properties';

describe('Brush Tool Properties', () => {
  let brushProperties: BrushToolProperties;

  beforeEach(() => {
    brushProperties = new BrushToolProperties();
  });

  it('should create ', () => {
    expect(brushProperties).toBeDefined();
    expect(brushProperties.strokeWidth.value).toBe(BrushToolProperties.MIN_THICKNESS);
    expect(brushProperties.texture.value).toEqual(BrushTextureType.TEXTURE_1);
  });
});
