import { ColorizeShapeCommand } from '@models/commands/shape-commands/colorize-shape-command';
import { BaseShape } from 'src/app/models/shapes/base-shape';
import { SimpleSelectionTool } from 'src/app/models/tools/editing-tools/simple-selection-tool';
import { EditorService } from 'src/app/services/editor.service';

export class ColorApplicatorTool extends SimpleSelectionTool {
  constructor(editorService: EditorService) {
    super(editorService);
  }

  selectShape(shape: BaseShape, rightClick: boolean = false): void {
    const color = rightClick ? this.editorService.colorsService.secondaryColor : this.editorService.colorsService.primaryColor;
    this.editorService.commandReceiver.add(new ColorizeShapeCommand(shape, this.editorService, color, !rightClick));
  }
}
