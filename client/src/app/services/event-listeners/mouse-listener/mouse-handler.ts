import { MouseEventAction } from 'src/app/services/event-listeners/mouse-listener/mouse-listener.service';

export interface MouseHandler {
  handleDblClick: MouseEventAction;
  handleWheel: MouseEventAction;
  handleMouseMove: MouseEventAction;
  handleMouseDown: MouseEventAction;
  handleMouseUp: MouseEventAction;
  handleMouseLeave: MouseEventAction;
  handleClick: MouseEventAction;
  handleContextMenu: MouseEventAction;

  handleMouseEvent(e: MouseEvent): boolean | void;
}
