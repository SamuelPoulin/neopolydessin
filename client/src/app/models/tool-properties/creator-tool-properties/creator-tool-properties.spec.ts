import { CreatorToolProperties } from 'src/app/models/tool-properties/creator-tool-properties/creator-tool-properties';

class CreatorToolPropertiesMock extends CreatorToolProperties {
  constructor(minStrokeWidth: number, maxStrokeWidth: number) {
    super(minStrokeWidth, maxStrokeWidth);
  }
}

describe('Creator Tool Properties', () => {
  let toolProperties: CreatorToolPropertiesMock;

  beforeEach(() => {
    toolProperties = new CreatorToolPropertiesMock(1, 2);
  });

  it('should create', () => {
    expect(toolProperties).toBeDefined();
  });
  it('should have property stroke width', () => {
    expect(toolProperties.strokeWidth.value).toEqual(1);
    expect(toolProperties.strokeWidth.minValue).toEqual(1);
    expect(toolProperties.strokeWidth.maxValue).toEqual(2);
  });
});
