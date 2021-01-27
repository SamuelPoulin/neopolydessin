import { Injectable } from '@angular/core';
import { AbstractEventListenerService, EventAction } from 'src/app/services/event-listeners/abstract-event-listener.service';
import { MouseHandler } from 'src/app/services/event-listeners/mouse-listener/mouse-handler';

export type MouseEventAction = EventAction<MouseEvent>;
@Injectable()
export class MouseListenerService extends AbstractEventListenerService<MouseEvent> {
  static readonly EVENT_DBLCLICK: string = 'dblclick';
  static readonly EVENT_WHEEL: string = 'wheel';
  static readonly EVENT_MOUSEMOVE: string = 'mousemove';
  static readonly EVENT_MOUSEDOWN: string = 'mousedown';
  static readonly EVENT_MOUSEUP: string = 'mouseup';
  static readonly EVENT_MOUSELEAVE: string = 'mouseleave';
  static readonly EVENT_CLICK: string = 'click';
  static readonly EVENT_CONTEXTMENU: string = 'contextmenu';
  static readonly BUTTON_LEFT: number = 0;
  static readonly BUTTON_RIGHT: number = 2;

  static defaultMouseListener(handler: MouseHandler): MouseListenerService {
    const mouseListenerService = new MouseListenerService();
    mouseListenerService.addEvents([
      [this.EVENT_DBLCLICK, handler.handleDblClick],
      [this.EVENT_WHEEL, handler.handleWheel],
      [this.EVENT_MOUSEMOVE, handler.handleMouseMove],
      [this.EVENT_MOUSEDOWN, handler.handleMouseDown],
      [this.EVENT_MOUSEUP, handler.handleMouseUp],
      [this.EVENT_MOUSELEAVE, handler.handleMouseLeave],
      [this.EVENT_CLICK, handler.handleClick],
      [this.EVENT_CONTEXTMENU, handler.handleContextMenu],
    ]);

    return mouseListenerService;
  }

  getIdentifierFromEvent(event: MouseEvent): string {
    return event.type;
  }
}
