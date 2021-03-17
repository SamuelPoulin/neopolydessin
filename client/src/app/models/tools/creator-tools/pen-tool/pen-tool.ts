import { PenToolProperties } from '@models/tool-properties/creator-tool-properties/pen-tool-properties';
import { EditorService } from '@services/editor.service';
import { Coordinate } from '@utils/math/coordinate';
import { Path } from '../../../shapes/path';
import { CreatorTool } from '../creator-tool';

export class PenTool extends CreatorTool {
  shape: Path;
  toolProperties: PenToolProperties;

  constructor(editorService: EditorService) {
    super(editorService);
    this.toolProperties = new PenToolProperties();
  }

  protected updateProperties(): void {
    this.shape.primaryColor = this.editorService.colorsService.primaryColor;
    this.shape.strokeWidth = this.toolProperties.strokeWidth.value;
    this.shape.updateProperties();
  }

  createShape(): Path {
    return new Path(this.mousePosition);
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
        this.editorService.socketService.sendStartPath(
          this.mousePosition,
          this.editorService.colorsService.primaryColor.hexString,
          this.toolProperties.strokeWidth.value,
        );
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
