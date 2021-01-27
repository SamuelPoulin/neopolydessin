import { Command } from 'src/app/models/commands/command';
import { EditorService } from 'src/app/services/editor.service';
import { BaseShape } from '../../shapes/base-shape';

export abstract class ShapesCommand implements Command {
  constructor(shapes: BaseShape[] | BaseShape, protected editorService: EditorService) {
    shapes = Array.isArray(shapes) ? shapes : [shapes];
    this.shapes = Array.from(shapes);
  }

  protected readonly shapes: BaseShape[];
  abstract execute(): void;
  abstract undo(): void;
}
