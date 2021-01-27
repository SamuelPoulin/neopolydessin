import { EventAction } from '@services/event-listeners/abstract-event-listener.service';
import { KeyboardListenerService } from '@services/event-listeners/keyboard-listener/keyboard-listener.service';
import { SelectionMove } from '@tools/editing-tools/selection-tool/selection-move.enum';
import { SelectionTool } from '@tools/editing-tools/selection-tool/selection-tool';

export class SelectionToolKeyboardEvents {
  static generateEvents(selectionTool: SelectionTool): ReadonlyArray<[string, EventAction<KeyboardEvent> | undefined]> {
    return [
      [
        KeyboardListenerService.getIdentifier('ArrowUp'),
        () => {
          selectionTool.handleKeyboardMove(SelectionMove.UP, true);
        },
      ],
      [
        KeyboardListenerService.getIdentifier('ArrowUp', false, false, 'keyup'),
        () => {
          selectionTool.handleKeyboardMove(SelectionMove.UP, false);
        },
      ],
      [
        KeyboardListenerService.getIdentifier('ArrowRight'),
        () => {
          selectionTool.handleKeyboardMove(SelectionMove.RIGHT, true);
        },
      ],
      [
        KeyboardListenerService.getIdentifier('ArrowRight', false, false, 'keyup'),
        () => {
          selectionTool.handleKeyboardMove(SelectionMove.RIGHT, false);
        },
      ],
      [
        KeyboardListenerService.getIdentifier('ArrowDown'),
        () => {
          selectionTool.handleKeyboardMove(SelectionMove.DOWN, true);
        },
      ],
      [
        KeyboardListenerService.getIdentifier('ArrowDown', false, false, 'keyup'),
        () => {
          selectionTool.handleKeyboardMove(SelectionMove.DOWN, false);
        },
      ],
      [
        KeyboardListenerService.getIdentifier('ArrowLeft'),
        () => {
          selectionTool.handleKeyboardMove(SelectionMove.LEFT, true);
        },
      ],
      [
        KeyboardListenerService.getIdentifier('ArrowLeft', false, false, 'keyup'),
        () => {
          selectionTool.handleKeyboardMove(SelectionMove.LEFT, false);
        },
      ],
      [
        KeyboardListenerService.getIdentifier('delete', false, false, 'keyup'),
        () => {
          selectionTool.editorService.deleteSelectedShapes();
        },
      ],
      // BEGIN ROTATION
      [
        KeyboardListenerService.getIdentifier('Shift', false, true),
        () => {
          selectionTool.shiftKey = true;
        },
      ],
      [
        KeyboardListenerService.getIdentifier('Shift', false, false, 'keyup'),
        () => {
          selectionTool.shiftKey = false;
        },
      ],
      [
        KeyboardListenerService.getIdentifier('Alt'),
        () => {
          selectionTool.altKey = true;
          return true;
        },
      ],
      [
        KeyboardListenerService.getIdentifier('Alt', false, true), // todo - add a wildcard for keyboard events
        () => {
          selectionTool.altKey = true;
          return true;
        },
      ],
      [
        KeyboardListenerService.getIdentifier('Alt', false, false, 'keyup'),
        () => {
          selectionTool.altKey = false;
          return true;
        },
      ],
      [
        KeyboardListenerService.getIdentifier('Alt', false, true, 'keyup'),
        () => {
          selectionTool.altKey = false;
          return true;
        },
      ],
    ];
  }
}
