import { Component, ElementRef, ViewChild } from '@angular/core';
import { AbstractColorStripComponent } from 'src/app/components/shared/color-picker/color-strip/abstract-color-strip.component';
import { Color } from 'src/app/utils/color/color';

@Component({
  selector: 'app-alpha',
  templateUrl: '../abstract-color-strip.component.html',
  styleUrls: ['../abstract-color-strip.component.scss'],
})
export class AlphaComponent extends AbstractColorStripComponent {
  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;

  getFillStyle(width: number, height: number): string | CanvasGradient | CanvasPattern {
    const gradient = this.renderingContext.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(1, 'black');
    return gradient;
  }

  calculateNewColor(value: number): Color {
    return Color.alpha(this.color, value);
  }

  shouldRedraw(color: Color, previousColor: Color): boolean {
    return color.a !== previousColor.a;
  }

  get value(): number {
    return this.color.a;
  }

  getIndicatorFillStyle(): string | CanvasGradient | CanvasPattern {
    return 'white';
  }

  getIndicatorStrokeStyle(): string | CanvasGradient | CanvasPattern {
    return 'black';
  }
}
