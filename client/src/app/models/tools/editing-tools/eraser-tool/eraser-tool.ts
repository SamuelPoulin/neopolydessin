import { EraserToolProperties } from '@tool-properties/editor-tool-properties/eraser-tool-properties';
import { EditorUtils } from '@utils/color/editor-utils';
import { MathUtils } from '@utils/math/math-utils';
import { RemoveShapesCommand } from 'src/app/models/commands/shape-commands/remove-shapes-command';
import { BaseShape } from 'src/app/models/shapes/base-shape';
import { Rectangle } from 'src/app/models/shapes/rectangle';
import { EraserUtils } from 'src/app/models/tools/editing-tools/eraser-tool/eraser-utils';
import { Tool } from 'src/app/models/tools/tool';
import { EditorService } from 'src/app/services/editor.service';
import { Color } from 'src/app/utils/color/color';
import { Coordinate } from 'src/app/utils/math/coordinate';

export class EraserTool extends Tool {
  // tslint:disable-next-line:no-magic-numbers
  static readonly DARKER_HIGHLIGHT_COLOR: Color = Color.rgb(0.8, 0, 0);
  static readonly HIGHLIGHT_COLOR: Color = Color.RED;
  private readonly eraserView: Rectangle;
  private colorData: Uint8ClampedArray | undefined;
  private selectedIndexes: number[];
  private removedShapes: BaseShape[];

  toolProperties: EraserToolProperties;

  constructor(public editorService: EditorService) {
    super(editorService);
    this.toolProperties = new EraserToolProperties();
    this.removedShapes = [];
    this.eraserView = new Rectangle(this.eraserPosition, this.size);
  }

  private erase(shape: BaseShape | undefined): void {
    if (shape) {
      this.editorService.removeShapeFromView(shape);
      this.removedShapes.push(shape);
      this.colorData = undefined;
      this.init();
    }
  }

  init(): void {
    this.editorService.loading = true;
    const clonedView = this.editorService.view.svg.cloneNode(true) as SVGElement;

    const background = clonedView.querySelector('#background');
    if (background) {
      background.setAttribute('fill', Color.RED.rgbString);
    }

    clonedView.childNodes.forEach((node: SVGElement) => {
      if (node.id.startsWith('shape-')) {
        const id = node.id.split('-').pop() as string;
        EraserUtils.sanitizeAndAssignColorToSvgNode(node, +id + 1);
      }
    });

    EditorUtils.viewToCanvas(this.editorService.view, clonedView)
      .then((ctx) => {
        if (ctx) {
          ctx.imageSmoothingEnabled = false;
        }
        const width = parseInt(clonedView.getAttribute('width') || '0', MathUtils.DECIMAL_RADIX);
        const height = parseInt(clonedView.getAttribute('height') || '0', MathUtils.DECIMAL_RADIX);

        this.colorData = ctx.getImageData(0, 0, width, height).data;
        if (!this.editorService.view.svg.contains(this.eraserView.svgNode)) {
          this.initEraserView();
        }
      })
      .finally(() => (this.editorService.loading = false));
  }

  selectShapes(pos: Coordinate): void {
    const { x, y } = pos;
    this.selectedIndexes = [];
    if (this.colorData) {
      for (let i = 0; i < this.size; i++) {
        for (let j = 0; j < this.size; j++) {
          const color = EditorUtils.colorAtPointFromUint8ClampedArray(
            this.colorData,
            new Coordinate(x + i, y + j),
            this.editorService.view.width,
          );

          if (!color || color.r > 0) {
            continue;
          }

          const index = EraserUtils.indexFromColor(color) - 1;
          const delta = Math.abs(index - Math.round(index));
          if (delta > EraserUtils.TOLERANCE) {
            continue;
          }

          if (index >= 0 && this.selectedIndexes.indexOf(index) === -1) {
            this.selectedIndexes.push(Math.round(index));
          }
        }
      }
    }
  }

  initMouseHandler(): void {
    this.handleMouseMove = () => {
      if (this.eraserView) {
        this.eraserView.primaryColor = Color.WHITE;
        this.eraserView.secondaryColor = Color.BLACK;
        this.eraserView.height = this.size;
        this.eraserView.width = this.size;
        this.eraserView.origin = this.eraserPosition;
        this.eraserView.updateProperties();
      }

      this.updateSelection();
    };

    this.handleMouseUp = () => {
      if (this.isActive && this.removedShapes.length) {
        const removeShapesCommand = new RemoveShapesCommand(this.removedShapes, this.editorService);
        this.editorService.commandReceiver.add(removeShapesCommand);
        this.removedShapes = [];
      }
      this.isActive = false;
    };

    this.handleMouseDown = (e) => {
      this.isActive = true;
      this.handleMouseMove(e);
    };
    this.handleMouseLeave = this.handleMouseUp;
  }

  updateSelection(): void {
    this.selectShapes(this.eraserPosition);

    this.getShapesNotSelected().forEach((shape) => shape.updateProperties());

    this.selectedIndexes.forEach(this.highlightShapeForId, this);
  }

  getShapesNotSelected(): BaseShape[] {
    return this.editorService.shapes.filter((s) => this.selectedIndexes.indexOf(s.id) === -1);
  }

  highlightShapeForId(id: number): void {
    const shape = this.editorService.findShapeById(id);
    if (shape) {
      const shapeColorIsHighlight =
        shape.primaryColor.compare(EraserTool.HIGHLIGHT_COLOR) || shape.secondaryColor.compare(EraserTool.HIGHLIGHT_COLOR);

      const highlightColor = shapeColorIsHighlight ? EraserTool.DARKER_HIGHLIGHT_COLOR : EraserTool.HIGHLIGHT_COLOR;

      shape.highlight(highlightColor, EraserUtils.SELECTION_THICKNESS);
      if (this.isActive) {
        this.erase(shape);
      }
    }
  }

  handleUndoRedoEvent(undo: boolean): void {
    super.handleUndoRedoEvent(undo);
    this.init();
  }

  initEraserView(): void {
    this.eraserView.primaryColor = Color.TRANSPARENT;
    this.eraserView.secondaryColor = Color.TRANSPARENT;
    this.eraserView.updateProperties();

    this.editorService.addPreviewShape(this.eraserView);
  }

  get eraserPosition(): Coordinate {
    const x = this.mousePosition.x - this.size / 2;
    const y = this.mousePosition.y - this.size / 2;
    return new Coordinate(x, y);
  }

  get size(): number {
    return this.toolProperties.eraserSize.value;
  }

  onSelect(): void {
    super.onSelect();
    this.init();
    this.initEraserView();
  }
}
