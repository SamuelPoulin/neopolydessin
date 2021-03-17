import { Coordinate } from '@utils/math/coordinate';
import { Path } from '../../../shapes/path';
import { CreatorTool } from '../creator-tool';

export abstract class StrokeTool extends CreatorTool {
  shape: Path;
  abstract createShape(): Path;

  protected updateProperties(): void {
    this.shape.primaryColor = this.editorService.colorsService.primaryColor;
  }

  protected startShape(coord: Coordinate = this.mousePosition): void {
    super.startShape();
    this.shape.addPoint(coord);
  }

  protected initListeners(): void {
    this.editorService.socketService.receiveStartPath().subscribe((coord: Coordinate) => {
      this.startShape(coord);
    });

    this.editorService.socketService.receiveUpdatePath().subscribe((coord: Coordinate) => {
      this.shape.addPoint(coord);
    });

    this.editorService.socketService.receiveEndPath().subscribe(() => {
      this.applyShape();
    });
  }

  initMouseHandler(): void {
    this.handleMouseDown = () => {
      if (!this.isActive) {
        // todo - change when lobbies send player role
        this.isActive = true;
        // this.startShape();
        this.editorService.socketService.sendStartPath(this.mousePosition);
      }
    };

    this.handleMouseMove = () => {
      if (this.isActive) {
        // todo - change when lobbies send player role
        // this.shape.addPoint(this.mousePosition);
        this.editorService.socketService.sendUpdatePath(this.mousePosition);
      }
    };

    this.handleMouseUp = () => {
      if (this.isActive) {
        // todo - change when lobbies send player role
        // this.applyShape();
        this.editorService.socketService.sendEndPath(this.mousePosition);
      }
    };

    this.handleMouseLeave = this.handleMouseUp;
  }
}
