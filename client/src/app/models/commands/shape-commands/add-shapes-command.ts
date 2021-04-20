import { ShapesCommand } from 'src/app/models/commands/shape-commands/shapes-command';

export class AddShapesCommand extends ShapesCommand {
  execute(): void {
    this.editorService.addShapeToBuffer(this.shapes);
    this.editorService.applyShapesBuffer();
    if (this.editorService.gameService.canDraw) {
      this.shapes.forEach((shape) => {
        this.editorService.socketService.sendAddPath(shape.serverId);
      });
    }
  }

  undo(): void {
    this.editorService.removeShapes(this.shapes);
  }
}
