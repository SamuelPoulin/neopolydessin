import { EditorComponent } from '@components/pages/editor/editor/editor.component';
import { KeyboardListenerService } from '@services/event-listeners/keyboard-listener/keyboard-listener.service';
import { ModalType } from '@services/modal/modal-type.enum';
import { GridProperties } from '@tool-properties/grid-properties/grid-properties';
import { GridVisibility } from '@tool-properties/grid-properties/grid-visibility.enum';
import { SelectionTool } from '@tools/editing-tools/selection-tool/selection-tool';
import { ToolType } from '@tools/tool-type.enum';

export class EditorKeyboardListener extends KeyboardListenerService {
  constructor(editorComponent: EditorComponent) {
    super();

    this.addEvents([
      [
        KeyboardListenerService.getIdentifier('l'),
        () => {
          editorComponent.currentToolType = ToolType.Line;
        },
      ],
      [
        KeyboardListenerService.getIdentifier('3'),
        () => {
          editorComponent.currentToolType = ToolType.Polygon;
        },
      ],
      [
        KeyboardListenerService.getIdentifier('a'),
        () => {
          editorComponent.currentToolType = ToolType.Spray;
        },
      ],
      [
        KeyboardListenerService.getIdentifier('c'),
        () => {
          editorComponent.currentToolType = ToolType.Pen;
        },
      ],
      [
        KeyboardListenerService.getIdentifier('w'),
        () => {
          editorComponent.currentToolType = ToolType.Brush;
        },
      ],
      [
        KeyboardListenerService.getIdentifier('1'),
        () => {
          editorComponent.currentToolType = ToolType.Rectangle;
        },
      ],
      [
        KeyboardListenerService.getIdentifier('i'),
        () => {
          editorComponent.currentToolType = ToolType.Pipette;
        },
      ],
      [
        KeyboardListenerService.getIdentifier('s'),
        () => {
          editorComponent.currentToolType = ToolType.Select;
          return false;
        },
      ],
      [
        KeyboardListenerService.getIdentifier('a', true),
        () => {
          (editorComponent.editorService.tools.get(ToolType.Select) as SelectionTool).selectAll();
          return false;
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
        KeyboardListenerService.getIdentifier('g', false),
        () => {
          editorComponent.editorService.gridProperties.visibility.value =
            editorComponent.editorService.gridProperties.visibility.value === GridVisibility.visible
              ? GridVisibility.hidden
              : GridVisibility.visible;
        },
      ],
      [
        KeyboardListenerService.getIdentifier('b'),
        () => {
          editorComponent.currentToolType = ToolType.ColorFill;
          return false;
        },
      ],
      [
        KeyboardListenerService.getIdentifier('r'),
        () => {
          editorComponent.currentToolType = ToolType.ColorApplicator;
          return false;
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
        KeyboardListenerService.getIdentifier('2'),
        () => {
          editorComponent.currentToolType = ToolType.Ellipse;
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
      [
        KeyboardListenerService.getIdentifier('e', true),
        () => {
          editorComponent.dialog.openByName(ModalType.EXPORT);
          return true;
        },
      ],
      [
        KeyboardListenerService.getIdentifier('c', true, false),
        () => {
          editorComponent.editorService.copySelectedShapes();
          return true;
        },
      ],
      [
        KeyboardListenerService.getIdentifier('x', true, false),
        () => {
          editorComponent.editorService.cutSelectedShapes();
          return true;
        },
      ],
      [
        KeyboardListenerService.getIdentifier('v', true, false),
        () => {
          editorComponent.editorService.pasteClipboard();
          return true;
        },
      ],
      [
        KeyboardListenerService.getIdentifier('d', true, false),
        () => {
          editorComponent.editorService.duplicateSelectedShapes();
          return true;
        },
      ],
      [
        KeyboardListenerService.getIdentifier('delete', false, false),
        () => {
          editorComponent.editorService.deleteSelectedShapes();
          return true;
        },
      ],
      [
        KeyboardListenerService.getIdentifier('s', true),
        () => {
          editorComponent.dialog.openByName(ModalType.SAVE);
          return true;
        },
      ],
    ]);

    this.defaultEventAction = (e) => {
      return editorComponent.currentTool ? editorComponent.currentTool.handleKeyboardEvent(e) : false;
    };
  }
}
