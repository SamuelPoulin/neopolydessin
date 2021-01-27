import { ContourType } from 'src/app/models/tool-properties/creator-tool-properties/contour-type.enum';
import { ShapeToolProperties } from 'src/app/models/tool-properties/creator-tool-properties/shape-tool-properties/shape-tool-properties';

export class ShapeToolPropertiesImpl extends ShapeToolProperties {
  constructor() {
    super();
  }
}
describe('ShapeToolProperties', () => {
  let shapeToolProperties: ShapeToolProperties;

  beforeEach(() => {
    shapeToolProperties = new ShapeToolPropertiesImpl();
  });

  it('should create', () => {
    expect(shapeToolProperties).toBeDefined();
  });

  it('should init contourType property', () => {
    expect(shapeToolProperties.contourType.value).toEqual(ContourType.FILLED_CONTOUR);
    expect(shapeToolProperties.contourType.choices).toEqual([ContourType.FILLED_CONTOUR, ContourType.FILLED, ContourType.CONTOUR]);
  });

  it('should init strokeWidth property', () => {
    expect(shapeToolProperties.strokeWidth.value).toEqual(ShapeToolProperties.MIN_THICKNESS);
    expect(shapeToolProperties.strokeWidth.minValue).toEqual(ShapeToolProperties.MIN_THICKNESS);
    expect(shapeToolProperties.strokeWidth.maxValue).toEqual(ShapeToolProperties.MAX_THICKNESS);
  });
});
