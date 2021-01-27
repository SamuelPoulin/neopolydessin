import { PenToolProperties } from 'src/app/models/tool-properties/creator-tool-properties/pen-tool-properties';

describe('Pen Tool Properties', () => {
  let penProperties: PenToolProperties;

  beforeEach(() => {
    penProperties = new PenToolProperties();
  });

  it('should create with the default thickness', () => {
    expect(penProperties).toBeDefined();
    expect(penProperties.strokeWidth.value).toBe(PenToolProperties.MIN_THICKNESS);
  });
});
