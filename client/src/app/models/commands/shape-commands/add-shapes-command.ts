import { ShapesCommand } from 'src/app/models/commands/shape-commands/shapes-command';

export class AddShapesCommand extends ShapesCommand {
  execute(): void {
    this.editorService.addShapeToBuffer(this.shapes);
    this.editorService.applyShapesBuffer();
  }

  undo(): void {
    this.editorService.removeShapes(this.shapes);
  }
}
