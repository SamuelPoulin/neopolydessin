import { AbstractEventListenerService } from 'src/app/services/event-listeners/abstract-event-listener.service';

export class KeyboardListenerService extends AbstractEventListenerService<KeyboardEvent> {
  static getIdentifier(key: string, ctrlKey: boolean = false, shiftKey: boolean = false, type: string = 'keydown'): string {
    let identifier = '';

    identifier += ctrlKey ? 'ctrl_' : '';
    identifier += shiftKey ? 'shift_' : '';
    identifier += key.toUpperCase();
    identifier += `_${type}`;

    return identifier;
  }

  getIdentifierFromEvent(event: KeyboardEvent): string {
    return KeyboardListenerService.getIdentifier(event.key, event.ctrlKey, event.shiftKey, event.type);
  }
}
