import { AfterViewInit, ElementRef, HostListener, Input, OnChanges, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { Color } from 'src/app/utils/color/color';
import { Coordinate } from 'src/app/utils/math/coordinate';

export abstract class AbstractCanvasDrawer implements OnInit, OnChanges, AfterViewInit {
  static readonly DEFAULT_INDICATOR_SIZE: number = 20;
  static readonly DEFAULT_INDICATOR_LINE_WIDTH: number = 3;

  @Input('color')
  set color(color: Color) {
    const shouldUpdateColor = color && this.color;
    shouldUpdateColor ? this.updateColor(color) : (this._color = color);
  }

  get color(): Color {
    return this._color;
  }

  private _color: Color;

  @Input() indicatorSize: number;
  @Input() indicatorLineWidth: number;
  abstract canvas: ElementRef<HTMLCanvasElement>;
  renderingContext: CanvasRenderingContext2D;
  mouseIsDown: boolean;

  constructor() {
    this._color = Color.WHITE;
    this.indicatorSize = AbstractCanvasDrawer.DEFAULT_INDICATOR_SIZE;
    this.indicatorLineWidth = AbstractCanvasDrawer.DEFAULT_INDICATOR_LINE_WIDTH;
    this.mouseIsDown = false;
  }

  updateColor(color: Color): void {
    const shouldRedraw = this.shouldRedraw(color, this.color);
    this._color = color;
    if (shouldRedraw) {
      this.drawAll();
    }
  }

  abstract calculateIndicatorPosition(): Coordinate;

  abstract draw(): void;

  abstract drawIndicator(position: Coordinate): void;

  abstract shouldRedraw(color: Color, previousColor: Color): boolean;

  abstract calculateColorFromMouseEvent(event: MouseEvent): Color;

  ngOnInit(): void {
    this.renderingContext = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
  }

  ngAfterViewInit(): void {
    this.drawAll();
  }

  drawAll(): void {
    if (this.renderingContext) {
      this.draw();
      this.drawIndicator(this.calculateIndicatorPosition());
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const colorPropName = 'color';
    const change: SimpleChange = changes[colorPropName];

    if (change) {
      const color: Color = change.currentValue;
      const previousColor: Color = change.previousValue;
      const shouldDraw = !previousColor || (color && this.shouldRedraw(color, previousColor));
      if (shouldDraw) {
        this.drawAll();
      }
    }
  }

  onMouseMove(event: MouseEvent): void {
    if (this.mouseIsDown) {
      this.color = this.calculateColorFromMouseEvent(event);
    }
  }

  onMouseDown(event: MouseEvent): void {
    this.mouseIsDown = true;
    this.color = this.calculateColorFromMouseEvent(event);
  }

  @HostListener('window:mouseup')
  onMouseUp(): void {
    this.mouseIsDown = false;
  }
}
