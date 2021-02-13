import { DrawingSurfaceComponent } from '@components/pages/editor/drawing-surface/drawing-surface.component';
import { BaseShape } from '@models/shapes/base-shape';
import { Path } from '@models/shapes/path';
import { ShapeError } from '@models/shapes/shape-error/shape-error';
import { Color } from '@utils/color/color';
import { Coordinate } from '@utils/math/coordinate';

export class EditorUtils {
  static async colorAtPoint(view: DrawingSurfaceComponent, position: Coordinate): Promise<Color> {
    return EditorUtils.viewToCanvas(view).then(async (ctx) => {
      const color = EditorUtils.colorAtPointInCanvas(ctx, position);
      return new Promise<Color>((resolve) => {
        resolve(color);
      });
    });
  }

  static colorAtPointInCanvas(canvasContext: CanvasRenderingContext2D, point: Coordinate): Color {
    const colorData = canvasContext.getImageData(point.x, point.y, 1, 1).data;
    return Color.rgb255(colorData[0], colorData[1], colorData[2]);
  }

  static async viewToCanvas(view: DrawingSurfaceComponent, svg: SVGElement = view.svg): Promise<CanvasRenderingContext2D> {
    const image = new Image();
    const { width, height }: { width: number; height: number } = view;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.imageSmoothingEnabled = false;

    const xml = new XMLSerializer().serializeToString(svg);
    image.src = 'data:image/svg+xml;base64,' + btoa(xml);
    image.style.display = 'none';

    return new Promise((resolve) => {
      image.onload = () => {
        ctx.drawImage(image, 0, 0);
        resolve(ctx);
      };
    });
  }

  /**
   *  https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
   */
  static colorAtPointFromUint8ClampedArray(data: Uint8ClampedArray | undefined, point: Coordinate, width: number): Color | undefined {
    if (!data) {
      return undefined;
    }
    const { x, y }: { x: number; y: number } = Coordinate.apply(point, Math.ceil);
    const getColorIndices = () => {
      const dataSize = 4;
      const rIndex = y * (width * dataSize) + x * dataSize;

      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      return [rIndex, rIndex + 1, rIndex + 2, rIndex + 3];
    };

    const indices = getColorIndices();
    const r = data[indices[0]];
    const g = data[indices[1]];
    const b = data[indices[2]];
    return Color.rgb255(r, g, b);
  }

  /**
   * Based on: https://stackoverflow.com/questions/3768565/drawing-an-svg-file-on-a-html5-canvas
   */
  static createDataURL(surface: DrawingSurfaceComponent): string {
    const xmlSerializer = new XMLSerializer();
    const svgString = xmlSerializer.serializeToString(surface.svg);
    return 'data:image/svg+xml,' + encodeURIComponent(svgString);
  }
  static createSerializedString(surface: DrawingSurfaceComponent): string {
    const xmlSerializer = new XMLSerializer();
    const svgString = xmlSerializer.serializeToString(surface.svg);
    return svgString;
  }

  static createShape(data: BaseShape, preserveId: boolean = true): BaseShape {
    let shape: BaseShape;
    const id = preserveId ? data.id : undefined;
    switch (data.type) {
      case 'Path':
        shape = new Path(undefined, id);
        break;
      default:
        throw ShapeError.typeNotFound(data.type);
    }
    shape.readShape(data);
    return shape;
  }
}
