import { PenToolProperties } from '@models/tool-properties/creator-tool-properties/pen-tool-properties';
import { EditorService } from '@services/editor.service';
import { Coordinate } from '@utils/math/coordinate';
import { Color } from '@utils/color/color';
import { take } from 'rxjs/operators';
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
    this.shape.addPoint(coord);
  }

  initListeners(): void {
    // todo - move to editor?
    this.editorService.socketService.receiveStartPath().subscribe((pathData: { id: number; coord: Coordinate; brush: BrushInfo }) => {
      this.editorService.colorsService.primaryColor = Color.ahex(pathData.brush.color);
      this.toolProperties.strokeWidth.value = pathData.brush.strokeWidth * this.editorService.scalingToClient;
      this.startShape(Coordinate.copy(pathData.coord).scale(this.editorService.scalingToClient));
      this.shape.updateProperties();
    });

    this.editorService.socketService.receiveUpdatePath().subscribe((coord: Coordinate) => {
      this.shape.addPoint(Coordinate.copy(coord).scale(this.editorService.scalingToClient));
    });

    this.editorService.socketService.receiveEndPath().subscribe((coord: Coordinate) => {
      this.shape.addPoint(Coordinate.copy(coord).scale(this.editorService.scalingToClient));
      this.applyShape();
    });
  }

  initMouseHandler(): void {
    this.handleMouseDown = () => {
      if (!this.isActive) {
        this.startShape();
        this.editorService.socketService.sendStartPath(
          this.mousePosition.scale(this.editorService.scalingToServer),
          this.editorService.colorsService.primaryColor.ahexString,
          this.toolProperties.strokeWidth.value * this.editorService.scalingToServer,
        );
        this.editorService.socketService
          .receiveStartPath()
          .pipe(take(1))
          .subscribe((pathData: { id: number; coord: Coordinate; brush: BrushInfo }) => {
            console.log('received' + pathData.id);
            this.shape.serverId = pathData.id;
          });
      }
    };

    this.handleMouseMove = () => {
      if (this.isActive) {
        this.shape.addPoint(this.mousePosition);
        this.editorService.socketService.sendUpdatePath(this.mousePosition.scale(this.editorService.scalingToServer));
      }
    };

    this.handleMouseUp = () => {
      if (this.isActive) {
        this.applyShape();
        this.editorService.socketService.sendEndPath(this.mousePosition.scale(this.editorService.scalingToServer));
      }
    };

    this.handleMouseLeave = this.handleMouseUp;
  }
}
