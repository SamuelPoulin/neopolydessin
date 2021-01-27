import { BaseShape } from 'src/app/models/shapes/base-shape';
import { Color } from 'src/app/utils/color/color';
import { MathUtils } from 'src/app/utils/math/math-utils';

export class EraserUtils {
  static readonly MAX_HEX: string = '0x010000';
  static readonly COLOR_DELTA: number = 5;
  static readonly SELECTION_THICKNESS: number = 3;
  static readonly TOLERANCE: number = 0.000000001;

  static get maxIndex(): number {
    const maxHex = parseInt(this.MAX_HEX, MathUtils.HEX_RADIX);
    return Math.floor(maxHex / this.COLOR_DELTA);
  }

  static fitIndex(index: number): number {
    return index % this.maxIndex;
  }

  static colorFromIndex(index: number): Color {
    const hex: string = MathUtils.toHex(this.fitIndex(index) * this.COLOR_DELTA, MathUtils.HEX_PADDING);
    return Color.hex(hex);
  }

  static indexFromColor(color: Color): number {
    return parseInt(color.hex, 16) / this.COLOR_DELTA;
  }

  static assignColorToShapeFromIndex(node: SVGElement, index: number): void {
    const color = this.colorFromIndex(index);

    const style = node.style;
    if (style.fill !== BaseShape.CSS_NONE) {
      style.fill = color.rgbString;
    }
    if (style.stroke !== BaseShape.CSS_NONE) {
      style.stroke = color.rgbString;
    }
  }

  static sanitizeSvgNode(node: SVGElement): void {
    const width = node.style.strokeWidth;
    if (!width || +width < this.SELECTION_THICKNESS) {
      node.style.strokeWidth = this.SELECTION_THICKNESS.toString();
    }
    node.setAttribute('filter', '');
  }

  static sanitizeAndAssignColorToSvgNode(node: SVGElement, id: number): void {
    const sanitizeChildNodes = (childNode: SVGElement) => {
      EraserUtils.sanitizeSvgNode(childNode);
      EraserUtils.assignColorToShapeFromIndex(childNode, id);
      childNode.childNodes.forEach(sanitizeChildNodes);
    };
    sanitizeChildNodes(node);
  }
}
