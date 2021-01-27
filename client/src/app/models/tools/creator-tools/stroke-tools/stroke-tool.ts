import { Path } from '../../../shapes/path';
import { CreatorTool } from '../creator-tool';

export abstract class StrokeTool extends CreatorTool {
  shape: Path;
  abstract createShape(): Path;

  protected updateProperties(): void {
    this.shape.primaryColor = this.editorService.colorsService.primaryColor;
  }

  protected startShape(): void {
    super.startShape();
    this.shape.addPoint(this.mousePosition);
  }

  initMouseHandler(): void {
    this.handleMouseDown = () => {
      if (!this.isActive) {
        this.startShape();
      }
    };

    this.handleMouseMove = () => {
      if (this.isActive) {
        this.shape.addPoint(this.mousePosition);
      }
    };

    this.handleMouseUp = () => {
      if (this.isActive) {
        this.applyShape();
      }
    };

    this.handleMouseLeave = this.handleMouseUp;
  }
}
