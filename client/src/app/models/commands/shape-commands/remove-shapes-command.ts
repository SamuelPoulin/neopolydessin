import { ShapesCommand } from 'src/app/models/commands/shape-commands/shapes-command';

export class RemoveShapesCommand extends ShapesCommand {
  execute(): void {
    this.editorService.removeShapes(this.shapes);
  }

  undo(): void {
    this.editorService.addShapeToBuffer(this.shapes);
    this.editorService.applyShapesBuffer();
    if (this.editorService.gameService.canDraw) {
      this.shapes.forEach((shape) => {
        this.editorService.socketService.sendAddPath(shape.serverId);
      });
    }
  }
}
