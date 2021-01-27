import { ShapesCommand } from '@models/commands/shape-commands/shapes-command';
import { BaseShape } from '@models/shapes/base-shape';
import { EditorService } from '@services/editor.service';
import { Color } from '@utils/color/color';

export class ColorizeShapeCommand extends ShapesCommand {
  private readonly color: Color;
  private readonly oldColor: Color;
  private readonly primary: boolean;

  constructor(shape: BaseShape, editorService: EditorService, color: Color, primary: boolean) {
    super(shape, editorService);
    this.color = color;
    this.primary = primary;
    this.oldColor = primary ? shape.primaryColor : shape.secondaryColor;
  }

  private setColor(color: Color): void {
    this.primary ? (this.shapes[0].primaryColor = color) : (this.shapes[0].secondaryColor = color);
    this.shapes[0].updateProperties();
  }

  execute(): void {
    this.setColor(this.color);
  }

  undo(): void {
    this.setColor(this.oldColor);
  }
}
