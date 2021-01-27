import { Ellipse } from '@models/shapes/ellipse';
import { ShapeTool } from 'src/app/models/tools/creator-tools/shape-tools/shape-tool';
import { EditorService } from 'src/app/services/editor.service';
import { Coordinate } from 'src/app/utils/math/coordinate';

export class EllipseTool extends ShapeTool {
  shape: Ellipse;

  constructor(editorService: EditorService) {
    super(editorService);
  }

  createShape(): Ellipse {
    return new Ellipse(this.initialMouseCoord);
  }

  resizeShape(dimensions: Coordinate, origin: Coordinate = this.shape.origin): void {
    this.shape.radiusX = dimensions.x / 2;
    this.shape.radiusY = dimensions.y / 2;
    this.shape.origin = origin;
  }
}
