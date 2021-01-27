import { Injectable } from '@angular/core';
import { SelectedColorType } from 'src/app/services/selected-color-type.enum';
import { Color } from 'src/app/utils/color/color';
import { MathUtils } from 'src/app/utils/math/math-utils';

@Injectable({
  providedIn: 'root',
})
export class ColorsService {
  get primaryColor(): Color {
    return this.getColor(SelectedColorType.primary);
  }

  set primaryColor(color: Color) {
    this.setColorByType(color, SelectedColorType.primary);
  }

  get secondaryColor(): Color {
    return this.getColor(SelectedColorType.secondary);
  }

  set secondaryColor(color: Color) {
    this.setColorByType(color, SelectedColorType.secondary);
  }
  static readonly MAX_HISTORY_LENGTH: number = 10;
  private static COLOR_HISTORY: Color[] = new Array<Color>(ColorsService.MAX_HISTORY_LENGTH).fill(Color.WHITE);

  private _colors: Color[] = [Color.WHITE, Color.BLACK];

  static peekHistory(): Color | undefined {
    return this.COLOR_HISTORY.length !== 0 ? this.COLOR_HISTORY[this.COLOR_HISTORY.length - 1] : undefined;
  }

  static pushHistory(color: Color): Color | undefined {
    return this.COLOR_HISTORY.push(color) > this.MAX_HISTORY_LENGTH ? this.COLOR_HISTORY.shift() : undefined;
  }
  static getColorHistory(): Color[] {
    return this.COLOR_HISTORY;
  }

  swapColors(): void {
    const tempColor = this.secondaryColor;
    this.secondaryColor = this.primaryColor;
    this.primaryColor = tempColor;
  }

  getColor(index: SelectedColorType): Color {
    return this._colors[MathUtils.fit(index)];
  }

  setColorByType(color: Color, type: SelectedColorType): void {
    this._colors[MathUtils.fit(type)] = color;
  }

  setColorByTypeAndUpdateHistory(color: Color, type: SelectedColorType): void {
    this.setColorByType(color, type);
    if (ColorsService.peekHistory() !== color.opaqueColor) {
      ColorsService.pushHistory(color.opaqueColor);
    }
  }
}
