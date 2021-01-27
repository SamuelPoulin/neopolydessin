import { ShapesCommand } from 'src/app/models/commands/shape-commands/shapes-command';

export class RemoveShapesCommand extends ShapesCommand {
  execute(): void {
    this.editorService.removeShapes(this.shapes);
  }

  undo(): void {
    this.editorService.addShapeToBuffer(this.shapes);
    this.editorService.applyShapesBuffer();
  }
}
