import { PenToolProperties } from '@models/tool-properties/creator-tool-properties/pen-tool-properties';
import { EditorService } from '@services/editor.service';
import { Coordinate } from '@utils/math/coordinate';
import { Color } from '@utils/color/color';
import { Path } from '../../../shapes/path';
import { CreatorTool } from '../creator-tool';
import { BrushInfo } from '../../../../../../../common/communication/brush-info';

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

  createShape(coord: Coordinate): Path {
    return new Path(coord);
  }

  protected startShape(coord: Coordinate = this.mousePosition): void {
    super.startShape(coord);
  }

  initListeners(): void {
    this.editorService.socketService.receiveStartPath().subscribe((pathData: { coord: Coordinate; brush: BrushInfo }) => {
      this.editorService.colorsService.primaryColor = Color.hex(pathData.brush.color.slice(1));
      this.toolProperties.strokeWidth.value = pathData.brush.strokeWidth;
      this.startShape(pathData.coord);
      this.shape.updateProperties();
    });

    this.editorService.socketService.receiveUpdatePath().subscribe((coord: Coordinate) => {
      this.shape.addPoint(coord);
    });

    this.editorService.socketService.receiveEndPath().subscribe((coord: Coordinate) => {
      this.shape.addPoint(coord);
      this.applyShape();
    });
  }

  initMouseHandler(): void {
    this.handleMouseDown = () => {
      if (!this.isActive) {
        this.startShape();
        this.editorService.socketService.sendStartPath(
          this.mousePosition,
          this.editorService.colorsService.primaryColor.hexString,
          this.toolProperties.strokeWidth.value,
        );
      }
    };

    this.handleMouseMove = () => {
      if (this.isActive) {
        this.shape.addPoint(this.mousePosition);
        this.editorService.socketService.sendUpdatePath(this.mousePosition);
      }
    };

    this.handleMouseUp = () => {
      if (this.isActive) {
        this.applyShape();
        this.editorService.socketService.sendEndPath(this.mousePosition);
      }
    };

    this.handleMouseLeave = this.handleMouseUp;
  }
}
