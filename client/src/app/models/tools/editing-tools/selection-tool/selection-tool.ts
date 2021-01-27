import { MoveShapeCommand } from '@models/commands/shape-commands/move-shape-command';
import { RotateShapeCommand } from '@models/commands/shape-commands/rotate-shape-command';
import { EditorService } from '@services/editor.service';
import { MouseListenerService } from '@services/event-listeners/mouse-listener/mouse-listener.service';
import { SelectionMove } from '@tools/editing-tools/selection-tool/selection-move.enum';
import { SelectionToolKeyboardEvents } from '@tools/editing-tools/selection-tool/selection-tool-keyboard-events';
import { SimpleSelectionTool } from '@tools/editing-tools/simple-selection-tool';
import { Coordinate } from '@utils/math/coordinate';
import { BaseShape } from 'src/app/models/shapes/base-shape';
import { BoundingBox } from 'src/app/models/shapes/bounding-box';
import { Selection } from './selection';

// todo : distribute functionality into multiple sub-tool
export class SelectionTool extends SimpleSelectionTool {
  static readonly PASTED_OFFSET: number = 10;
  private readonly KEYBOARD_MOVE_RIGHT: Coordinate = new Coordinate(SelectionMove.KEYBOARD_MOVE_DISTANCE, 0);
  private readonly KEYBOARD_MOVE_DOWN: Coordinate = new Coordinate(0, SelectionMove.KEYBOARD_MOVE_DISTANCE);

  private initialMouseCoord: Coordinate;
  private mouseMoved: boolean;
  private reverseSelectionMode: boolean; // todo - create states
  private moveSelectionMode: boolean;

  private keyPresses: boolean[] = [];
  private keyInterval: number;
  private keyTimeout: number;
  private moveCommand: MoveShapeCommand;

  private readonly ROTATION_AMOUNT: number = 15;
  shiftKey: boolean;
  altKey: boolean;

  constructor(public editorService: EditorService, private selection: Selection = editorService.selection) {
    super(editorService);
    this.reverseSelectionMode = false;
    this.shiftKey = false;
    this.altKey = false;

    this.keyboardListener.addEvents(SelectionToolKeyboardEvents.generateEvents(this));
  }

  handleUndoRedoEvent(undo: boolean): void {
    super.handleUndoRedoEvent(undo);
    this.selection.clear();
    this.selection.updateBoundingBox();
    this.applyBoundingBox();
  }

  initMouseHandler(): void {
    this.handleWheel = (e: WheelEvent) => {
      if (this.selection.shapes.length === 0) {
        return false;
      }
      let angle = this.altKey ? 1 : this.ROTATION_AMOUNT;
      if (e.deltaY < 0) {
        angle = -angle;
      }
      this.rotateSelection(angle, this.shiftKey);
      return true;
    };

    this.handleMouseDown = (e: MouseEvent) => {
      if (!this.isActive) {
        this.isActive = true;
        this.mouseMoved = false;
        if (e.button === MouseListenerService.BUTTON_RIGHT) {
          this.beginSelection(this.mousePosition, true);
        } else if (this.selection.boundingBox && Selection.detectPointCollision(this.mousePosition, this.selection.boundingBox)) {
          this.startMove(this.mousePosition);
        } else if (e.button === MouseListenerService.BUTTON_LEFT) {
          this.beginSelection(this.mousePosition);
        }
      }
    };

    this.handleMouseMove = () => {
      if (this.isActive) {
        this.mouseMoved = true;
        this.moveSelectionMode ? this.move() : this.updateSelection(this.reverseSelectionMode);
      }
    };

    this.handleMouseUp = () => {
      if (this.isActive) {
        this.isActive = false;
        if (this.moveSelectionMode) {
          this.moveSelectionMode = false;
          this.mouseMoved ? this.endMove() : this.updateSelection();
        }
        setTimeout(() => {
          this.mouseMoved = false;
        });
        this.applyBoundingBox();
      }
    };
  }

  private rotateSelection(angle: number, individual: boolean = false): void {
    const center = individual ? undefined : this.selection.boundingBox.center;
    const shapes = new Array<BaseShape>();
    shapes.push(...this.selection.shapes);
    const rotationCommand = new RotateShapeCommand(shapes, this.editorService, angle, center);

    this.editorService.commandReceiver.add(rotationCommand);
    individual ? this.selection.updateBoundingBox() : this.selection.boundingBox.rotation += angle;
  }

  private calculateKeyboardMove(keyPresses: boolean[]): Coordinate {
    let result = new Coordinate();
    if (keyPresses[SelectionMove.UP]) {
      result = Coordinate.subtract(result, this.KEYBOARD_MOVE_DOWN);
    }
    if (keyPresses[SelectionMove.RIGHT]) {
      result = Coordinate.add(result, this.KEYBOARD_MOVE_RIGHT);
    }
    if (keyPresses[SelectionMove.DOWN]) {
      result = Coordinate.add(result, this.KEYBOARD_MOVE_DOWN);
    }
    if (keyPresses[SelectionMove.LEFT]) {
      result = Coordinate.subtract(result, this.KEYBOARD_MOVE_RIGHT);
    }
    return result;
  }

  handleKeyboardMove(key: number, isDown: boolean): void {
    this.keyPresses[key] = isDown;
    this.isActive = false;
    this.keyPresses.forEach((isActive) => {
      this.isActive = this.isActive || isActive;
    });
    this.isActive ? this.startKeyboardMove() : this.endKeyboardMove();
  }

  private startKeyboardMove(): void {
    if (this.keyTimeout) {
      return;
    }
    let keyMoveDelta = this.calculateKeyboardMove(this.keyPresses);
    this.startMove();
    this.move(keyMoveDelta);

    this.keyTimeout = window.setTimeout(() => {
      this.keyInterval = window.setInterval(() => {
        keyMoveDelta = Coordinate.add(keyMoveDelta, this.calculateKeyboardMove(this.keyPresses));
        this.move(keyMoveDelta);
      }, SelectionMove.KEYBOARD_INTERVAL);
    }, SelectionMove.KEYBOARD_TIMEOUT - SelectionMove.KEYBOARD_INTERVAL);
  }

  private endKeyboardMove(): void {
    this.endMove();
    window.clearTimeout(this.keyTimeout);
    this.keyTimeout = 0;
    window.clearInterval(this.keyInterval);
    this.keyInterval = 0;
  }

  private startMove(c: Coordinate = new Coordinate()): void {
    this.initialMouseCoord = Coordinate.copy(c);
    this.moveSelectionMode = true;
    const moveShapes = new Array<BaseShape>();
    moveShapes.push(...this.selection.shapes);
    moveShapes.push(this.selection.boundingBox);
    this.moveCommand = new MoveShapeCommand(moveShapes, this.editorService);
  }

  private move(delta: Coordinate = Coordinate.subtract(this.mousePosition, this.initialMouseCoord)): void {
    this.moveCommand.delta = delta;
    this.moveCommand.execute();
  }

  private endMove(): void {
    this.editorService.commandReceiver.add(this.moveCommand);
  }

  selectShape(shape: BaseShape, rightClick: boolean = false): void {
    if(this.mouseMoved) {
      return;
    } else if (rightClick) {
      this.selection.reverse(shape);
    } else {
      this.resetSelection();
      this.selection.addSelectedShape(shape);
    }
    this.selection.updateBoundingBox();
    this.applyBoundingBox();
  }

  selectAll(): void {
    this.resetSelection();
    this.selection.shapes.push(...this.editorService.shapes);
    this.selection.updateBoundingBox();
  }

  private beginSelection(c: Coordinate, reverse: boolean = false): void {
    this.reverseSelectionMode = reverse;
    this.initialMouseCoord = Coordinate.copy(c);
    if (reverse) {
      this.initSelectArea();
      this.selection.previous.length = 0;
      this.selection.previous.push(...this.selection.shapes);
    } else {
      this.resetSelection();
    }
  }

  private initSelectArea(): void {
    this.selection.resizeArea(this.initialMouseCoord);
    this.editorService.addPreviewShape(this.selection.area);
  }

  private initBoundingBox(): void {
    this.selection.boundingBox = new BoundingBox(this.initialMouseCoord);
    this.editorService.addPreviewShape(this.selection.boundingBox);
  }

  private resetSelection(): void {
    this.editorService.clearShapesBuffer();
    this.selection.clear();
    this.initSelectArea();
    this.initBoundingBox();
  }

  applyBoundingBox(): void {
    this.editorService.clearShapesBuffer();
    this.editorService.addPreviewShape(this.selection.boundingBox);
  }

  private updateSelection(reverse: boolean = this.reverseSelectionMode): void {
    this.resetSelection();
    this.selection.resizeArea(this.initialMouseCoord, this.mousePosition);

    if (reverse) {
      this.selection.shapes.push(...this.selection.previous);
    }

    this.editorService.shapes.forEach((shape) => {
      if (Selection.detectBoundingBoxCollision(this.selection.area, shape)) {
        reverse ? this.selection.reverse(shape, this.selection.previous) : this.selection.addSelectedShape(shape);
      }
    });
    this.selection.updateBoundingBox();
  }
}
