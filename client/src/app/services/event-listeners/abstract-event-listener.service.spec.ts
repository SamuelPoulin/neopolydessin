/* tslint:disable:no-string-literal */
import { AbstractEventListenerService, EventAction } from 'src/app/services/event-listeners/abstract-event-listener.service';
import Spy = jasmine.Spy;
import createSpy = jasmine.createSpy;
import createSpyObj = jasmine.createSpyObj;

export class AbstractEventListenerServiceImpl extends AbstractEventListenerService<Event> {
  getIdentifierFromEvent(event: Event): string {
    return event.type;
  }
}

describe('AbstractEventListenerService', () => {
  let preventDefaultSpy: Spy;
  const preventDefault = () => {
    preventDefaultSpy();
  };
  let eventListenerService: AbstractEventListenerService<Event>;
  beforeEach(() => {
    preventDefaultSpy = createSpy('preventDefaultSpy');
    eventListenerService = new AbstractEventListenerServiceImpl();

    eventListenerService['eventsHandlingMap'].set('a', createSpy().and.returnValue(false));
    eventListenerService['eventsHandlingMap'].set('b', createSpy().and.returnValue(true));
    eventListenerService['eventsHandlingMap'].set('c', createSpy().and.returnValue(false));
    eventListenerService['eventsHandlingMap'].set('d', createSpy().and.returnValue(true));
    eventListenerService['eventsHandlingMap'].set('e', createSpy().and.returnValue(true));
  });

  it('should create', () => {
    expect(eventListenerService).toBeTruthy();
  });

  it('can call right function', () => {
    const event = { type: 'b', preventDefault } as Event;

    expect(eventListenerService.handle(event)).toEqual(true);
    expect(eventListenerService['eventsHandlingMap'].get('b')).toHaveBeenCalledWith(event);
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('can call right function and not prevent default', () => {
    const event = { type: 'a', preventDefault } as Event;

    expect(eventListenerService.handle(event)).toEqual(false);
    expect(eventListenerService['eventsHandlingMap'].get('a')).toHaveBeenCalledWith(event);
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it('does not prevent default when failure to get event action', () => {
    const event = {
      type: 'INVALID',
      preventDefault,
    } as KeyboardEvent;
    expect(eventListenerService['eventsHandlingMap'].get('INVALID')).toBeUndefined();
    expect(eventListenerService.handle(event)).toEqual(false);
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it('can execute default action', () => {
    const defaultMethodSpy = createSpyObj(['act']);
    eventListenerService.defaultEventAction = () => {
      defaultMethodSpy.act();
      return true;
    };

    const event = {
      type: 'invalid',
      preventDefault,
    } as KeyboardEvent;

    eventListenerService.handle(event);
    expect(defaultMethodSpy.act).toHaveBeenCalled();
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('does not call default action if event exists in map', () => {
    eventListenerService.defaultEventAction = createSpy('defaultEventAction').and.returnValue(() => true);
    const event = {
      type: 'b',
      preventDefault,
    } as KeyboardEvent;

    expect(eventListenerService.handle(event)).toEqual(true);
    expect(eventListenerService['eventsHandlingMap'].get('b')).toHaveBeenCalledWith(event);
    expect(eventListenerService.defaultEventAction).not.toHaveBeenCalled();
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('can add event', () => {
    eventListenerService.addEvent('ID', () => false);
    expect(eventListenerService['eventsHandlingMap'].get('ID')).toBeDefined();
  });

  it('does not handle events if not listening', () => {
    const event = { type: 'b', preventDefault } as Event;
    eventListenerService.listening = false;

    expect(eventListenerService.handle(event)).toEqual(false);
    expect(preventDefaultSpy).not.toHaveBeenCalled();
    expect(eventListenerService['eventsHandlingMap'].get('b')).not.toHaveBeenCalled();
  });

  it('can add multiple events', () => {
    eventListenerService.addEvents([
      ['ID1', () => false],
      ['ID2', () => false],
    ]);
    expect(eventListenerService['eventsHandlingMap'].get('ID1')).toBeDefined();
    expect(eventListenerService['eventsHandlingMap'].get('ID2')).toBeDefined();
    const func: EventAction<Event> = eventListenerService['eventsHandlingMap'].get('ID1') as EventAction<Event>;
    expect(func({} as Event)).toEqual(false);
  });
});
