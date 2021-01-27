export type EventAction<T> = (event: T) => boolean | void;
export type EventsHandlingMap<T> = Map<string, EventAction<T>>;
export abstract class AbstractEventListenerService<T extends Event> {
  protected readonly eventsHandlingMap: EventsHandlingMap<T>;
  defaultEventAction: EventAction<T>;
  listening: boolean;

  constructor() {
    this.eventsHandlingMap = new Map<string, EventAction<T>>();
    this.listening = true;
  }

  abstract getIdentifierFromEvent(event: T): string;

  /**
   * returns true if default prevented
   */
  handle(event: T): boolean {
    if (!this.listening) {
      return false;
    }
    const func = this.eventsHandlingMap.get(this.getIdentifierFromEvent(event));
    const success = func ? func(event) : this.defaultEventAction ? this.defaultEventAction(event) : false;

    if (success) {
      event.preventDefault();
    }
    return success || false;
  }

  addEvents(events: ReadonlyArray<[string, EventAction<T> | undefined]>): void {
    events.forEach((event) => {
      this.addEvent(event[0], event[1]);
    });
  }

  addEvent(eventIdentifier: string, action: EventAction<T> | undefined): void {
    if (action) {
      this.eventsHandlingMap.set(eventIdentifier, action);
    }
  }
}
