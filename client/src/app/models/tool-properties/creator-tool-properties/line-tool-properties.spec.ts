import { LineJunctionType } from '@tool-properties/creator-tool-properties/line-junction-type.enum';
import { LineToolProperties } from 'src/app/models/tool-properties/creator-tool-properties/line-tool-properties';

describe('Line Tool Properties', () => {
  let lineProperties: LineToolProperties;

  beforeEach(() => {
    lineProperties = new LineToolProperties();
  });

  it('should create', () => {
    expect(lineProperties).toBeDefined();
    expect(lineProperties.strokeWidth.value).toBe(LineToolProperties.MIN_THICKNESS);
    expect(lineProperties.junctionDiameter.value).toEqual(LineToolProperties.MIN_DIAMETER);
    expect(lineProperties.junctionType.value).toEqual(LineJunctionType.POINTS);
  });
});
