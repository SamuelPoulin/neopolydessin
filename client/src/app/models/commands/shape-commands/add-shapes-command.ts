import { ShapesCommand } from 'src/app/models/commands/shape-commands/shapes-command';

export class AddShapesCommand extends ShapesCommand {
  execute(): void {
    this.editorService.addShapeToBuffer(this.shapes);
    this.editorService.applyShapesBuffer();
    this.shapes.forEach((shape) => {
      this.editorService.socketService.sendAddPath(shape.id - 1); // todo - conform to server standard
    });
  }

  undo(): void {
    this.editorService.removeShapes(this.shapes);
  }
}
