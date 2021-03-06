import { Injectable } from '@angular/core';
import { CommandReceiver } from '@models/commands/command-receiver';
import { Path } from '@models/shapes/path';
import { ShapeError } from '@models/shapes/shape-error/shape-error';
import { GridProperties } from '@tool-properties/grid-properties/grid-properties';
import { PenTool } from '@tools/creator-tools/pen-tool/pen-tool';
import { EraserTool } from '@tools/editing-tools/eraser-tool/eraser-tool';
import { Tool } from '@tools/tool';
import { ToolType } from '@tools/tool-type.enum';
import { Color } from '@utils/color/color';
import { EditorUtils } from '@utils/color/editor-utils';
import { Coordinate } from '@utils/math/coordinate';
import { VIEWPORT_DIMENSION } from '@common/communication/viewport';
import { Subscription } from 'rxjs';
import { DrawingSurfaceComponent } from 'src/app/components/pages/editor/drawing-surface/drawing-surface.component';
import { BaseShape } from 'src/app/models/shapes/base-shape';
import { ColorsService } from 'src/app/services/colors.service';
import { APIService } from './api.service';
import { GameService } from './game.service';
import { SocketService } from './socket-service.service';

@Injectable({
  providedIn: 'root',
})
export class EditorService {
  static readonly SNAPSHOT_INTERVAL: number = 100;

  readonly tools: Map<ToolType, Tool>;
  readonly shapes: BaseShape[];
  private shapesBuffer: BaseShape[];
  private previewShapes: BaseShape[];
  private readonly _commandReceiver: CommandReceiver;

  private removePathSubscription: Subscription;
  private addPathSubscription: Subscription;

  readonly gridProperties: GridProperties;
  view: DrawingSurfaceComponent;
  loading: boolean;

  isFreeEdit: boolean = false;

  recordedDrawings: string[][];
  private drawingIndex: number;
  private snapshotIndex: number;
  private recordInterval: NodeJS.Timeout;

  get commandReceiver(): CommandReceiver {
    return this._commandReceiver;
  }

  get scalingToClient(): number {
    return this.view ? this.view.width / VIEWPORT_DIMENSION : 1;
  }

  get scalingToServer(): number {
    return this.view ? VIEWPORT_DIMENSION / this.view.width : 1;
  }

  constructor(public colorsService: ColorsService, public socketService: SocketService, public gameService: GameService) {
    this._commandReceiver = new CommandReceiver();

    this.tools = new Map<ToolType, Tool>();
    this.recordedDrawings = [];

    this.initListeners();
    this.gameService.roleChanged.subscribe(() => {
      this.initListeners();
    });
    this.gameService.gameStarted.subscribe(() => {
      this.recordedDrawings = [];
      this.drawingIndex = -1;
    });
    this.gameService.drawingChanged.subscribe(() => {
      if (this.recordInterval) clearTimeout(this.recordInterval);
      this.resetDrawing();
      this.drawingIndex++;
      this.recordedDrawings[this.drawingIndex] = [];
      this.snapshotIndex = 0;
      this.recordInterval = setInterval(() => {
        this.recordedDrawings[this.drawingIndex][this.snapshotIndex] = EditorUtils.createDataURL(this.view.svg);
        this.snapshotIndex++;
      }, EditorService.SNAPSHOT_INTERVAL);
    });
    this.gameService.gameEnded.subscribe(() => {
      if (this.recordInterval) clearTimeout(this.recordInterval);
    });

    this.shapesBuffer = new Array<BaseShape>();
    this.shapes = new Array<BaseShape>();
    this.previewShapes = new Array<BaseShape>();
    this.gridProperties = new GridProperties();

    this.loading = false;
  }

  resetDrawing(): void {
    this.applyShapesBuffer();
    if (this.view) {
      this.shapes.forEach(this.view.removeShape, this.view);
    }
    this.shapesBuffer.length = 0;
    this.shapes.length = 0;
    this.previewShapes.length = 0;

    setTimeout(() => {
      this.commandReceiver.clear();
    });
  }

  exportDrawing(): string {
    return JSON.stringify(this.shapes, BaseShape.jsonReplacer);
  }

  async importDrawingById(drawingId: string, apiService: APIService): Promise<void> {
    return new Promise<void>((resolve) => {
      apiService.getDrawingById(drawingId).then((drawing) => {
        Object.values(JSON.parse(drawing.data)).forEach((shapeData) => {
          const shape = EditorUtils.createShape(shapeData as BaseShape);
          this.addShapeToBuffer(shape);
          this.applyShapesBuffer();
          resolve();
        });
      });
    });
  }

  private initTools(): void {
    this.tools.forEach((tool) => {
      if (tool.removeListeners) tool.removeListeners();
    });

    this.tools.set(ToolType.Pen, new PenTool(this));
    this.tools.set(ToolType.Eraser, new EraserTool(this));
  }

  initListeners(): void {
    this.initTools();

    this.removePathSubscription?.unsubscribe();
    this.addPathSubscription?.unsubscribe();

    if (!this.gameService.canDraw && !this.isFreeEdit) {
      this.removePathSubscription = this.socketService.receiveRemovePath().subscribe((id: number) => {
        const shape = this.findShapeById(id, true);
        if (shape) {
          this.removeShape(shape);
        }
      });
      this.addPathSubscription = this.socketService.receiveAddPath().subscribe((data) => {
        const shape = new Path();
        shape.primaryColor = Color.ahex(data.brush.color);
        shape.strokeWidth = data.brush.strokeWidth * this.scalingToClient;
        shape.serverId = data.id;
        data.path.forEach((coord: Coordinate) => {
          shape.addPoint(Coordinate.copy(coord).scale(this.scalingToClient));
        });
        this.shapes.push(shape);
        this.view.addShape(shape);
        shape.updateProperties();
      });
    }
  }

  sortShapes(): void {
    const allShapes = this.shapes.concat(this.shapesBuffer);
    const sortedShapes = allShapes.sort((a, b): number => {
      return a.zIndex - b.zIndex;
    });

    allShapes.forEach(this.view.removeShape, this.view);
    sortedShapes.forEach(this.view.addShape, this.view);
  }

  applyShapesBuffer(): void {
    this.shapes.push(...this.shapesBuffer);
    this.shapesBuffer.length = 0;
    this.clearShapesBuffer();
  }

  clearShapesBuffer(): void {
    const removeShapes = (shape: BaseShape): void => {
      if (this.view) {
        this.view.removeShape(shape);
      }
    };
    this.shapesBuffer.forEach(removeShapes);
    this.previewShapes.forEach(removeShapes);
    this.shapesBuffer.length = 0;
    this.previewShapes.length = 0;
  }

  addPreviewShape(shape: BaseShape): void {
    this.previewShapes.push(shape);
    if (this.view) {
      this.view.addShape(shape);
    }
  }

  addShapeToBuffer(shapes: BaseShape | BaseShape[]): void {
    shapes = Array.isArray(shapes) ? shapes : [shapes];
    shapes.forEach((shape: BaseShape) => {
      if (!this.view) {
        this.shapesBuffer.push(shape);
      } else if (!this.view.svg.contains(shape.svgNode)) {
        this.shapesBuffer.push(shape);
        this.sortShapes(); // adds shapes to view
      }
    });
  }

  removeShapes(shapes: BaseShape[]): void {
    shapes.forEach(this.removeShape, this);
  }

  removeShapeFromView(shape: BaseShape): void {
    this.socketService.sendRemovePath(shape.serverId);
    this.view.removeShape(shape);
  }

  removeShape(shape: BaseShape): void {
    const index = this.shapes.findIndex((s: BaseShape) => s === shape);
    if (index !== -1) {
      this.shapes.splice(index, 1);
      this.removeShapeFromView(shape);
    }
  }

  findShapeById(id: number, useServerID: boolean = false): BaseShape | undefined {
    let matchingShapes;
    if (useServerID) {
      matchingShapes = this.shapes.filter((shape: BaseShape) => shape.serverId === id);
    } else {
      matchingShapes = this.shapes.filter((shape: BaseShape) => shape.id === id);
    }
    if (matchingShapes.length > 1) {
      throw ShapeError.idCollision();
    }
    return matchingShapes.length ? matchingShapes[0] : undefined;
  }

  setReady() {
    this.socketService.sendReady();
  }
}
