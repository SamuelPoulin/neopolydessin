/* tslint:disable:no-string-literal */
import { MockEditorService } from '@services/editor.service.spec';
import { ShapesCommand } from 'src/app/models/commands/shape-commands/shapes-command';
import { Rectangle } from 'src/app/models/shapes/rectangle';

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
    const command = new ShapesCommandImpl(rect, {} as MockEditorService);
    expect(command['shapes']).toEqual([rect]);
  });

  it('can create command with multiple shapes', () => {
    const rect = new Rectangle();
    const rect2 = new Rectangle();
    const command = new ShapesCommandImpl([rect, rect2], {} as MockEditorService);
    expect(command['shapes']).toEqual([rect, rect2]);
  });
});
