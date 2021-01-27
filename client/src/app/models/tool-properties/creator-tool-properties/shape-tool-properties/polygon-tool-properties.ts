import { NumericProperty } from '@tool-properties/props/numeric-property/numeric-property';
import { Polygon } from 'src/app/models/shapes/polygon';
import { ShapeToolProperties } from 'src/app/models/tool-properties/creator-tool-properties/shape-tool-properties/shape-tool-properties';

export class PolygonToolProperties extends ShapeToolProperties {
  nEdges: NumericProperty;
  constructor() {
    super();
    this.nEdges = new NumericProperty(Polygon.MIN_POLY_EDGES, Polygon.MAX_POLY_EDGES);
  }
}
