import { AddShapesCommand } from '@models/commands/shape-commands/add-shapes-command';
import { Coordinate } from '@utils/math/coordinate';
import { BaseShape } from 'src/app/models/shapes/base-shape';
import { Tool } from 'src/app/models/tools/tool';
import { EditorService } from 'src/app/services/editor.service';

export abstract class CreatorTool extends Tool {
  abstract shape: BaseShape | undefined;
  abstract createShape(coord: Coordinate): BaseShape;

  protected constructor(editorService: EditorService, isActive: boolean = false) {
    super(editorService);
    this.isActive = isActive;
  }

  protected abstract updateProperties(): void;

  handleMouseEvent(e: MouseEvent): boolean {
    const result = super.handleMouseEvent(e);
    if (this.isActive) {
      this.updateProperties();
    }
    return result;
  }

  protected startShape(coord: Coordinate, zIndex: number = 1): void {
    this.isActive = true;
    this.shape = this.createShape(coord);
    this.shape.zIndex = zIndex;
    this.updateProperties();
    this.addShape();
  }

  applyShape(undoRedoAble: boolean = true): void {
    this.updateProperties();
    if (this.shape) {
      if (undoRedoAble) {
        this.editorService.commandReceiver.push(new AddShapesCommand(this.shape, this.editorService));
      }
      this.editorService.applyShapesBuffer();
    }
    this.shape = undefined;
    this.isActive = false;
  }

  addShape(): void {
    if (this.shape) {
      this.editorService.addShapeToBuffer(this.shape);
    }
  }
}
