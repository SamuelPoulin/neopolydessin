import { Polygon } from '@models/shapes/polygon';
import { EditorService } from '@services/editor.service';
import { KeyboardListenerService } from '@services/event-listeners/keyboard-listener/keyboard-listener.service';
import { PolygonToolProperties } from '@tool-properties/creator-tool-properties/shape-tool-properties/polygon-tool-properties';
import { Coordinate } from '@utils/math/coordinate';
import { ShapeTool } from './shape-tool';

export class PolygonTool extends ShapeTool {
  shape: Polygon;
  toolProperties: PolygonToolProperties;

  constructor(editorService: EditorService) {
    super(editorService);
    this.toolProperties = new PolygonToolProperties();
    this.setEqualDimensions(true);
    this.keyboardListener.addEvents([
      [
        KeyboardListenerService.getIdentifier('Shift', false, false, 'keyup'),
        () => {
          this.setEqualDimensions(true);
        },
      ],
    ]);
    this.toolProperties = new PolygonToolProperties();
  }

  createShape(): Polygon {
    return new Polygon(this.initialMouseCoord, this.toolProperties.nEdges.value);
  }

  updateCurrentCoord(c: Coordinate): void {
    this.previewArea.origin = this.initialMouseCoord;
    this.previewArea.end = c;
    const delta = Coordinate.subtract(c, this.initialMouseCoord);
    this.resizeShape(delta, this.previewArea.origin);
  }

  resizeShape(dimensions: Coordinate, origin: Coordinate = this.shape.origin): void {
    this.shape.updatePoints(dimensions, origin);
  }
}
