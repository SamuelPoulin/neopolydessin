import { Color } from '@utils/color/color';
import { Coordinate } from '@utils/math/coordinate';
import { Direction } from '@utils/math/direction.enum';

export type ColorGetter = (point: Coordinate) => Color | undefined;
export type ColorSetter = (point: Coordinate, color: Color) => void;

/**
 * Based on: https://en.wikipedia.org/wiki/Flood_fill
 */
export class ColorFillUtils {
  getColor: ColorGetter;
  setColor: ColorSetter;
  private node: Coordinate;
  private targetColor: Color;
  private replacementColor: Color;
  private tolerance: number;

  constructor(getColor?: ColorGetter, setColor?: ColorSetter) {
    if (getColor) {
      this.getColor = getColor;
    }
    if (setColor) {
      this.setColor = setColor;
    }
  }

  updateNode(node: Coordinate, direction: Direction): Coordinate | undefined {
    const neighbor = node.neighbor(direction);
    const neighborColor = this.getColor(neighbor);
    if (this.nodeColorIsTarget(neighborColor)) {
      this.setColor(neighbor, this.replacementColor);
      return neighbor;
    }
    return undefined;
  }

  private nodeColorIsTarget(color: Color | undefined): boolean {
    if (!color) {
      return false;
    }
    return color.compare(this.targetColor, this.tolerance) && !color.compare(this.replacementColor);
  }

  private updateNodes(node: Coordinate, queue: Coordinate[]): void {
    const update = (direction: Direction): void => {
      const res = this.updateNode(node, direction);
      if (res) {
        queue.push(res);
      }
    };

    update(Direction.North);
    update(Direction.East);
    update(Direction.South);
    update(Direction.West);
  }

  floodFill(node: Coordinate, targetColor: Color, replacementColor: Color, tolerance: number = 0): void {
    this.node = node;
    this.targetColor = targetColor;
    this.replacementColor = replacementColor;
    this.tolerance = tolerance;

    this.setColor(this.node, this.replacementColor);
    const Q: Coordinate[] = [this.node];
    while (Q.length !== 0) {
      const n: Coordinate = Q.shift() as Coordinate;
      this.updateNodes(n, Q);
    }
  }
}
