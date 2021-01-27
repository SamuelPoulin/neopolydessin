import { ShapeToolProperties } from '@tool-properties/creator-tool-properties/shape-tool-properties/shape-tool-properties';
import { Rectangle } from 'src/app/models/shapes/rectangle';
import { CreatorTool } from 'src/app/models/tools/creator-tools/creator-tool';
import { EditorService } from 'src/app/services/editor.service';
import { KeyboardListenerService } from 'src/app/services/event-listeners/keyboard-listener/keyboard-listener.service';
import { Color } from 'src/app/utils/color/color';
import { Coordinate } from 'src/app/utils/math/coordinate';

export abstract class ShapeTool extends CreatorTool {
  protected constructor(editorService: EditorService) {
    super(editorService);

    this.previewArea = new Rectangle();
    this.forceEqualDimensions = false;
    this.keyboardListener.addEvents([
      [
        KeyboardListenerService.getIdentifier('Shift', false, true),
        () => {
          this.setEqualDimensions(true);
        },
      ],
      [
        KeyboardListenerService.getIdentifier('Shift', false, false, 'keyup'),
        () => {
          this.setEqualDimensions(false);
        },
      ],
    ]);
    this.toolProperties = new ShapeToolProperties();
  }
  protected previewArea: Rectangle;
  private forceEqualDimensions: boolean;
  protected initialMouseCoord: Coordinate;
  toolProperties: ShapeToolProperties;

  abstract resizeShape(origin: Coordinate, dimensions: Coordinate): void;

  protected startShape(): void {
    this.initialMouseCoord = this.mousePosition;
    super.startShape();
    this.updateCurrentCoord(this.mousePosition);
    this.previewArea.primaryColor = Color.TRANSPARENT;
    this.previewArea.updateProperties();
    this.editorService.addPreviewShape(this.previewArea);
  }

  initMouseHandler(): void {
    this.handleMouseMove = () => {
      if (this.isActive) {
        this.updateCurrentCoord(this.mousePosition);
      }
    };

    this.handleMouseDown = () => {
      if (!this.isActive) {
        this.startShape();
      }
    };

    this.handleMouseUp = () => {
      if (this.isActive) {
        this.applyShape();
      }
    };
  }

  setEqualDimensions(value: boolean): void {
    this.forceEqualDimensions = value;
    if (this.isActive) {
      this.updateCurrentCoord(this.mousePosition);
    }
  }

  updateCurrentCoord(c: Coordinate): void {
    this.previewArea.origin = this.initialMouseCoord;
    this.previewArea.end = c;

    let dimensions: Coordinate;
    let origin = Coordinate.copy(this.previewArea.origin);
    const delta = Coordinate.subtract(c, this.initialMouseCoord);

    if (this.forceEqualDimensions) {
      const minDimension = Math.min(this.previewArea.width, this.previewArea.height);
      dimensions = new Coordinate(minDimension, minDimension);
    } else {
      dimensions = new Coordinate(this.previewArea.width, this.previewArea.height);
    }

    if (delta.y < 0) {
      origin = new Coordinate(origin.x, origin.y + this.previewArea.height - dimensions.y);
    }

    if (delta.x < 0) {
      origin = new Coordinate(origin.x + this.previewArea.width - dimensions.x, origin.y);
    }

    this.resizeShape(dimensions, origin);
  }

  protected updateProperties(): void {
    if (this.shape) {
      const { contourType, strokeWidth } = this.toolProperties;
      const { primaryColor, secondaryColor } = this.editorService.colorsService;

      this.shape.contourType = contourType.value;
      this.shape.strokeWidth = strokeWidth.value;
      this.shape.primaryColor = primaryColor;
      this.shape.secondaryColor = secondaryColor;
      this.shape.updateProperties();
    }
  }
}
