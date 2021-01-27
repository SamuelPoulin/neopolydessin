import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AbstractCanvasDrawer } from 'src/app/components/shared/color-picker/abstract-canvas-drawer/abstract-canvas-drawer';
import { defaultErrorMessages, ErrorMessages } from 'src/app/components/shared/inputs/error-messages';
import { ColorsService } from 'src/app/services/colors.service';
import { Color } from 'src/app/utils/color/color';
import { ColorComponents } from 'src/app/utils/color/color-components';
import { Coordinate } from 'src/app/utils/math/coordinate';
import { MathUtils } from 'src/app/utils/math/math-utils';

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss'],
})
export class ColorPickerComponent extends AbstractCanvasDrawer implements OnInit {
  static readonly DEFAULT_SIZE: number = 300;
  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;
  @Input() isVertical: boolean;
  @Input() size: number;
  @Input() showHistory: boolean;
  @Output() colorChanged: EventEmitter<Color>;
  @Output() closed: EventEmitter<unknown>;

  hexInputErrorMessages: ErrorMessages<string>;
  formGroup: FormGroup;
  initialColor: Color;

  constructor() {
    super();
    this.isVertical = false;
    this.size = ColorPickerComponent.DEFAULT_SIZE;
    this.showHistory = false;
    this.colorChanged = new EventEmitter<Color>();
    this.closed = new EventEmitter();

    this.hexInputErrorMessages = defaultErrorMessages({ pattern: 'Doit être une couleur valide' });
    this.formGroup = new FormGroup({});
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.initialColor = this.color;
  }

  calculateIndicatorPosition(): Coordinate {
    return new Coordinate((this.color.h / MathUtils.MAX_ANGLE) * this.size, this.color.s * this.size);
  }

  draw(): void {
    if (this.renderingContext) {
      for (let i = 0; i < this.size; i++) {
        const h = (i / this.size) * MathUtils.MAX_ANGLE;
        const gradient = this.renderingContext.createLinearGradient(0, 0, 0, this.size);
        gradient.addColorStop(0, Color.getHslString(h, 0, 1 / 2));
        gradient.addColorStop(1, Color.getHslString(h, 1, 1 / 2));

        this.renderingContext.fillStyle = gradient;
        this.renderingContext.fillRect(i, 0, 1, this.size);
      }
    }
  }

  drawIndicator(position: Coordinate): void {
    const { x, y } = position;
    const color = Color.hsl(this.color.h, this.color.s, 1 / 2);
    this.renderingContext.fillStyle = color.hexString;
    this.renderingContext.strokeStyle = color.negative.hexString;
    this.renderingContext.lineWidth = this.indicatorLineWidth;
    this.renderingContext.fillRect(x - this.indicatorSize / 2, y - this.indicatorSize / 2, this.indicatorSize, this.indicatorSize);
    this.renderingContext.strokeRect(x - this.indicatorSize / 2, y - this.indicatorSize / 2, this.indicatorSize, this.indicatorSize);
  }

  calculateColorFromMouseEvent(event: MouseEvent): Color {
    const h = (event.offsetX / this.size) * MathUtils.MAX_ANGLE;
    const s = event.offsetY / this.size;
    return Color.hsl(h, s, this.color.l, this.color.a);
  }

  shouldRedraw(color: Color, previousColor: Color): boolean {
    return previousColor.h !== color.h || previousColor.s !== color.s;
  }

  colorChange(color: Color): void {
    this.color = color;
  }

  alphaChangeColor(color: Color): void {
    this.color = Color.alpha(this.color, color.a);
  }

  alphaChange(value: string): void {
    this.color = Color.alpha(this.color, parseInt(value, MathUtils.DECIMAL_RADIX) / MathUtils.PERCENT_FACTOR);
  }

  rgbChange(value: string, component: string): void {
    let { r, g, b }: ColorComponents = this.color.color255;
    switch (component) {
      case 'r':
        r = parseInt(value, 16);
        break;
      case 'g':
        g = parseInt(value, 16);
        break;
      case 'b':
        b = parseInt(value, 16);
        break;
    }
    const colorHasNotChanged = this.color.r255 === r && this.color.g255 === g && this.color.b255 === b;
    if (!colorHasNotChanged) {
      this.color = Color.rgb255(r, g, b, this.color.a);
    }
  }

  hexChange(value: string): void {
    if (this.color.hex !== value.toLowerCase()) {
      this.color = Color.hex(value, this.color.a);
    }
  }

  cancel(): void {
    this.color = this.initialColor;
    this.closed.emit();
  }

  confirm(): void {
    if (this.colorHasChanged) {
      ColorsService.pushHistory(this.color.opaqueColor);
    }
    this.initialColor = this.color;
    this.colorChanged.emit(this.color);
  }

  get colorHasChanged(): boolean {
    return this.initialColor.rgbString !== this.color.rgbString;
  }

  get alpha(): string {
    return Math.round(this.color.a * MathUtils.PERCENT_FACTOR).toString();
  }
}
