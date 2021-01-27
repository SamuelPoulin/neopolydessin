/* tslint:disable:no-string-literal */
import { EventAction } from 'src/app/services/event-listeners/abstract-event-listener.service';
import { KeyboardListenerService } from 'src/app/services/event-listeners/keyboard-listener/keyboard-listener.service';
import createSpy = jasmine.createSpy;
import Spy = jasmine.Spy;
import createSpyObj = jasmine.createSpyObj;

describe('KeyboardListenerService', () => {
  let preventDefaultSpy: Spy;
  const preventDefault = () => {
    preventDefaultSpy();
  };

  let keyboardListener: KeyboardListenerService;

  beforeEach(() => {
    preventDefaultSpy = createSpy('preventDefaultSpy');
    preventDefaultSpy.calls.reset();

    keyboardListener = new KeyboardListenerService();
    keyboardListener['eventsHandlingMap'].set('C_keydown', () => false);
    keyboardListener['eventsHandlingMap'].set('X_keydown', () => true);
    keyboardListener['eventsHandlingMap'].set('Z_keydown', () => false);
    keyboardListener['eventsHandlingMap'].set('Z_keyup', () => true);
    keyboardListener['eventsHandlingMap'].set('ctrl_shift_A_keydown', () => true);
  });

  it('should create', () => {
    expect(keyboardListener).toBeTruthy();
  });

  it('can call right function on keydown', () => {
    const event = {
      ctrlKey: true,
      shiftKey: true,
      key: 'a',
      preventDefault,
    } as KeyboardEvent;

    expect(keyboardListener.handle(event)).toEqual(true);
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('can call right function on keyup', () => {
    const event = {
      key: 'z',
      type: 'keyup',
      preventDefault,
    } as KeyboardEvent;

    expect(keyboardListener.handle(event)).toEqual(true);
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('does not prevent default when failure', () => {
    const event = {
      key: 'b',
      preventDefault,
    } as KeyboardEvent;
    const identifier = keyboardListener.getIdentifierFromEvent(event);

    expect(keyboardListener['eventsHandlingMap'].get(identifier)).toBeUndefined();
    expect(keyboardListener.handle(event)).toEqual(false);
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it('does not prevent default when handler function returns false', () => {
    const event = {
      key: 'c',
      preventDefault,
    } as KeyboardEvent;
    const identifier = keyboardListener.getIdentifierFromEvent(event);

    expect(keyboardListener['eventsHandlingMap'].get(identifier)).toBeDefined();
    expect(keyboardListener.handle(event)).toEqual(false);
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it('can execute default action', () => {
    const defaultMethodSpy = createSpyObj(['act']);
    keyboardListener.defaultEventAction = () => {
      defaultMethodSpy.act();
      return true;
    };

    const event = {
      key: 'y',
      preventDefault,
    } as KeyboardEvent;

    keyboardListener.handle(event);
    expect(defaultMethodSpy.act).toHaveBeenCalled();
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('does not call default action if event exists in map', () => {
    keyboardListener.defaultEventAction = createSpy('defaultEventAction').and.returnValue(() => true);
    const event = {
      key: 'x',
      preventDefault,
    } as KeyboardEvent;

    expect(keyboardListener.handle(event)).toEqual(true);
    expect(keyboardListener.defaultEventAction).not.toHaveBeenCalled();
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('can get identifier', () => {
    expect(KeyboardListenerService.getIdentifier('key', true, true, 'type')).toEqual('ctrl_shift_KEY_type');
    expect(KeyboardListenerService.getIdentifier('key1')).toEqual('KEY1_keydown');
  });

  it('can get same identifier for keys in lower or upper case', () => {
    const id1 = KeyboardListenerService.getIdentifier('key', false, true);
    const id2 = KeyboardListenerService.getIdentifier('Key', false, true);
    const id3 = KeyboardListenerService.getIdentifier('Key', false, false);
    const id4 = KeyboardListenerService.getIdentifier('key', false, false);

    expect(id1).toEqual(id2);
    expect(id3).toEqual(id4);
  });

  it('can get identifier from keyboard event', () => {
    const event = {
      key: 'KEY',
      ctrlKey: true,
      type: 'TYPE',
    } as KeyboardEvent;

    expect(keyboardListener.getIdentifierFromEvent(event)).toEqual('ctrl_KEY_TYPE');
  });

  it('can add event', () => {
    keyboardListener.addEvent('ID', () => false);
    expect(keyboardListener['eventsHandlingMap'].get('ID')).toBeDefined();
  });

  it('can add multiple events', () => {
    keyboardListener.addEvents([
      ['ID1', () => false],
      ['ID2', () => false],
    ]);
    expect(keyboardListener['eventsHandlingMap'].get('ID1')).toBeDefined();
    expect(keyboardListener['eventsHandlingMap'].get('ID2')).toBeDefined();
    const func: EventAction<KeyboardEvent> = keyboardListener['eventsHandlingMap'].get('ID1') as EventAction<KeyboardEvent>;
    expect(func({} as KeyboardEvent)).toEqual(false);
  });
});
