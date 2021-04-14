import { PenToolProperties } from '@models/tool-properties/creator-tool-properties/pen-tool-properties';
import { EditorService } from '@services/editor.service';
import { Coordinate } from '@utils/math/coordinate';
import { Color } from '@utils/color/color';
import { take } from 'rxjs/operators';
import { BrushInfo } from '@common/communication/brush-info';
import { Path } from '@models/shapes/path';
import { Subscription } from 'rxjs';
import { CreatorTool } from '../creator-tool';

export class PenTool extends CreatorTool {
  shape: Path;
  toolProperties: PenToolProperties;

  startSubscription: Subscription;
  updateSubscription: Subscription;
  endSubscription: Subscription;

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
    this.startSubscription = this.editorService.socketService
      .receiveStartPath()
      .subscribe((pathData: { id: number; coord: Coordinate; brush: BrushInfo }) => {
        this.editorService.colorsService.primaryColor =
          // eslint-disable-next-line
          pathData.brush.color.length > 7 ? Color.ahex(pathData.brush.color) : Color.hex(pathData.brush.color);
        this.toolProperties.strokeWidth.value = pathData.brush.strokeWidth * this.editorService.scalingToClient;
        this.startShape(Coordinate.copy(pathData.coord).scale(this.editorService.scalingToClient));
        this.shape.updateProperties();
        this.shape.serverId = pathData.id;
      });

    this.updateSubscription = this.editorService.socketService.receiveUpdatePath().subscribe((coord: Coordinate) => {
      this.shape.addPoint(Coordinate.copy(coord).scale(this.editorService.scalingToClient));
    });

    this.endSubscription = this.editorService.socketService.receiveEndPath().subscribe((coord: Coordinate) => {
      this.shape.addPoint(Coordinate.copy(coord).scale(this.editorService.scalingToClient));
      this.applyShape();
    });
  }

  removeListeners(): void {
    this.startSubscription?.unsubscribe();
    this.updateSubscription?.unsubscribe();
    this.endSubscription?.unsubscribe();
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
        const shape = this.shape;
        this.editorService.socketService
          .receiveStartPath()
          .pipe(take(1))
          .subscribe((pathData: { id: number; coord: Coordinate; brush: BrushInfo }) => {
            shape.serverId = pathData.id;
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
