import { AddShapesCommand } from '@models/commands/shape-commands/add-shapes-command';
import { BaseShape } from 'src/app/models/shapes/base-shape';
import { Tool } from 'src/app/models/tools/tool';
import { EditorService } from 'src/app/services/editor.service';

export abstract class CreatorTool extends Tool {
  abstract shape: BaseShape | undefined;
  abstract createShape(): BaseShape;

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

  protected startShape(): void {
    this.isActive = true;
    this.shape = this.createShape();
    this.updateProperties();
    this.addShape();
  }

  applyShape(): void {
    this.updateProperties();
    if (this.shape) {
      this.editorService.commandReceiver.add(new AddShapesCommand(this.shape, this.editorService));
    }
    this.shape = undefined;
    this.isActive = false;
  }

  addShape(): void {
    if (this.shape) {
      this.editorService.addShapeToBuffer(this.shape);
    }
  }

  cancelShape(): void {
    this.editorService.clearShapesBuffer();
    this.isActive = false;
  }
}
