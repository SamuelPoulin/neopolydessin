/* tslint:disable:no-string-literal */
import { ShapesCommand } from 'src/app/models/commands/shape-commands/shapes-command';
import { Ellipse } from 'src/app/models/shapes/ellipse';
import { Rectangle } from 'src/app/models/shapes/rectangle';
import { EditorService } from 'src/app/services/editor.service';

class ShapesCommandImpl extends ShapesCommand {
  execute(): void {
    return;
  }

  undo(): void {
    return;
  }
}

describe('ShapesCommand', () => {
  it('can create command with single shape', () => {
    const rect = new Rectangle();
    const command = new ShapesCommandImpl(rect, {} as EditorService);
    expect(command['shapes']).toEqual([rect]);
  });

  it('can create command with multiple shapes', () => {
    const rect = new Rectangle();
    const ellipse = new Ellipse();
    const command = new ShapesCommandImpl([rect, ellipse], {} as EditorService);
    expect(command['shapes']).toEqual([rect, ellipse]);
  });
});
