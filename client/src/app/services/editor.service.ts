import { Injectable } from '@angular/core';
import { CommandReceiver } from '@models/commands/command-receiver';
import { Drawing } from '@models/drawing';
import { ShapeError } from '@models/shapes/shape-error/shape-error';
import { GridProperties } from '@tool-properties/grid-properties/grid-properties';
import { PenTool } from '@tools/creator-tools/stroke-tools/pen-tool/pen-tool';
import { EraserTool } from '@tools/editing-tools/eraser-tool/eraser-tool';
import { Tool } from '@tools/tool';
import { ToolType } from '@tools/tool-type.enum';
import { EditorUtils } from '@utils/color/editor-utils';
import { DrawingSurfaceComponent } from 'src/app/components/pages/editor/drawing-surface/drawing-surface.component';
import { BaseShape } from 'src/app/models/shapes/base-shape';
import { ColorsService } from 'src/app/services/colors.service';
import { APIService } from './api.service';
import { LocalSaveService } from './localsave.service';

@Injectable({
  providedIn: 'root',
})
export class EditorService {
  readonly tools: Map<ToolType, Tool>;
  readonly shapes: BaseShape[];
  private shapesBuffer: BaseShape[];
  private previewShapes: BaseShape[];
  private readonly _commandReceiver: CommandReceiver;

  readonly selection: Selection;

  readonly gridProperties: GridProperties;
  view: DrawingSurfaceComponent;
  loading: boolean;

  get commandReceiver(): CommandReceiver {
    return this._commandReceiver;
  }

  constructor(public colorsService: ColorsService, private localSaveService: LocalSaveService) {
    this._commandReceiver = new CommandReceiver();
    this.commandReceiver.on('action', () => {
      this.saveLocally();
    });

    this.selection = new Selection();
    this.tools = new Map<ToolType, Tool>();
    this.initTools();

    this.shapesBuffer = new Array<BaseShape>();
    this.shapes = new Array<BaseShape>();
    this.previewShapes = new Array<BaseShape>();
    this.gridProperties = new GridProperties();

    this.loading = false;
  }

  resetDrawing(): void {
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

  importLocalDrawing(): void {
    Object.values(JSON.parse(this.localSaveService.drawing.data)).forEach((shapeData) => {
      const shape = EditorUtils.createShape(shapeData as BaseShape);
      this.addShapeToBuffer(shape);
    });
    this.applyShapesBuffer();
  }

  saveLocally(): void {
    if (this.view) {
      this.localSaveService.takeSnapshot(
        new Drawing('localsave', [], this.exportDrawing(), this.view.color.hex, this.view.width, this.view.height, ''),
      );
    }
  }

  private initTools(): void {
    this.tools.set(ToolType.Pen, new PenTool(this));
    this.tools.set(ToolType.Eraser, new EraserTool(this));
  }

  applyShapesBuffer(): void {
    this.shapes.push(...this.shapesBuffer);
    this.shapesBuffer = [];
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
    this.shapesBuffer = [];
    this.previewShapes = [];
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
        this.view.addShape(shape);
      }
    });
  }

  removeShapes(shapes: BaseShape[]): void {
    shapes.forEach(this.removeShape, this);
  }

  removeShapeFromView(shape: BaseShape): void {
    this.view.removeShape(shape);
  }

  removeShape(shape: BaseShape): void {
    const index = this.shapes.findIndex((s: BaseShape) => s === shape);
    if (index !== -1) {
      this.shapes.splice(index, 1);
      this.removeShapeFromView(shape);
    }
  }

  findShapeById(id: number): BaseShape | undefined {
    const matchingShapes = this.shapes.filter((shape: BaseShape) => shape.id === id);
    if (matchingShapes.length > 1) {
      throw ShapeError.idCollision();
    }
    return matchingShapes.length ? matchingShapes[0] : undefined;
  }
}
