import { EditorComponent } from '@components/pages/editor/editor/editor.component';
import { KeyboardListenerService } from '@services/event-listeners/keyboard-listener/keyboard-listener.service';
import { GridProperties } from '@tool-properties/grid-properties/grid-properties';
import { ToolType } from '@tools/tool-type.enum';

export class EditorKeyboardListener extends KeyboardListenerService {
  constructor(editorComponent: EditorComponent) {
    super();

    this.addEvents([
      [
        KeyboardListenerService.getIdentifier('c'),
        () => {
          editorComponent.currentToolType = ToolType.Pen;
        },
      ],

      [
        KeyboardListenerService.getIdentifier('+', false),
        () => {
          const increment = GridProperties.GRID_SIZE_INCREMENT;
          const size = editorComponent.editorService.gridProperties.size.value + increment;
          editorComponent.editorService.gridProperties.size.value = Math.floor(size / increment) * increment;
        },
      ],
      [
        KeyboardListenerService.getIdentifier('-', false),
        () => {
          const increment = GridProperties.GRID_SIZE_INCREMENT;
          const size = editorComponent.editorService.gridProperties.size.value - increment;
          editorComponent.editorService.gridProperties.size.value = Math.ceil(size / increment) * increment;
        },
      ],
      [
        KeyboardListenerService.getIdentifier('e'),
        () => {
          editorComponent.currentToolType = ToolType.Eraser;
          return false;
        },
      ],
      [
        KeyboardListenerService.getIdentifier('o', true),
        () => {
          editorComponent.openCreateModal();
          return true;
        },
      ],
      [
        KeyboardListenerService.getIdentifier('z', true),
        () => {
          editorComponent.editorService.commandReceiver.undo();
          if (editorComponent.currentTool) {
            editorComponent.currentTool.handleUndoRedoEvent(true);
          }
          return true;
        },
      ],
      [
        KeyboardListenerService.getIdentifier('z', true, true),
        () => {
          editorComponent.editorService.commandReceiver.redo();
          if (editorComponent.currentTool) {
            editorComponent.currentTool.handleUndoRedoEvent(false);
          }
          return true;
        },
      ],
    ]);

    this.defaultEventAction = (e) => {
      return editorComponent.currentTool ? editorComponent.currentTool.handleKeyboardEvent(e) : false;
    };
  }
}
