import { AddShapesCommand } from './add-shapes-command';

export class CopyShapeCommand extends AddShapesCommand {
  execute(): void {
    super.execute();
    this.editorService.updateShapeOffset(true);
  }
  undo(): void {
    super.undo();
    this.editorService.updateShapeOffset(false);
  }
}
