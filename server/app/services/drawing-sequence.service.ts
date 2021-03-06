import fs from 'fs';
import fsPath from 'path';
import { injectable } from 'inversify';
import { Coord, DrawingSequence, Segment } from '../../../common/communication/drawing-sequence';
import { VIEWPORT_DIMENSION } from '../../../common/communication/viewport';
import { DrawMode } from '../../../common/communication/draw-mode';
import { DEFAULT_BRUSH_INFO, Path } from '../../models/commands/path';
import { PictureWord } from '../../models/schemas/picture-word-pair';

const X1: number = 0;
const Y1: number = 1;
const X2: number = 2;
const Y2: number = 3;
const X3: number = 4;
const Y3: number = 5;

const ROUND_PRECISION_FACTOR: number = 100;
const BEZIER_PRECISION_MAXIMUM: number = 20;
const BEZIER_PRECICION_STEP: number = 25;

@injectable()
export class DrawingSequenceService {

  sequence(pictureWord: PictureWord): DrawingSequence {
    return pictureWord.uploadedPicturePath
      ? this.sequencePicture(pictureWord)
      : this.sequenceDrawing(pictureWord);
  }

  private sequencePicture(picture: PictureWord): DrawingSequence {
    const paths = this.parsePictureToDrawnPaths(picture);
    return this.sequenceUsingDrawMode(paths, picture.drawMode);
  }

  private sequenceDrawing(drawing: PictureWord): DrawingSequence {
    const paths = (drawing.drawnPaths as Path[]).map((path) => this.toSegment(path));
    return this.sequenceUsingDrawMode({
      height: VIEWPORT_DIMENSION,
      width: VIEWPORT_DIMENSION,
      stack: paths
    }, drawing.drawMode);
  }

  private sequenceUsingDrawMode(paths: DrawingSequence, drawMode: DrawMode): DrawingSequence {
    switch (drawMode) {

      case DrawMode.CONVENTIONAL:
        break;

      case DrawMode.CENTER_FIRST:
        const center = { x: paths.width / 2, y: paths.height / 2 };
        paths.stack.sort((a, b) => this.getCenterMost(a.path, center) - this.getCenterMost(b.path, center));
        break;

      case DrawMode.RANDOM:
        const segments: Segment[] = [];
        while (paths.stack.length > 0) {
          const randomIndex = Math.floor(Math.random() * paths.stack.length);
          const randomPath = paths.stack.splice(randomIndex, 1)[0];
          segments.push(randomPath);
        }
        paths.stack = segments;
        break;

      case DrawMode.PAN_B_TO_T:
        paths.stack.sort((a, b) => this.getTopMost(b.path) - this.getTopMost(a.path));
        break;

      case DrawMode.PAN_T_TO_B:
        paths.stack.sort((a, b) => this.getTopMost(a.path) - this.getTopMost(b.path));
        break;

      case DrawMode.PAN_L_TO_R:
        paths.stack.sort((a, b) => this.getLeftMost(a.path) - this.getLeftMost(b.path));
        break;

      case DrawMode.PAN_R_TO_L:
        paths.stack.sort((a, b) => this.getLeftMost(b.path) - this.getLeftMost(a.path));
        break;
    }

    const xRatio = VIEWPORT_DIMENSION / paths.height;
    const yRatio = VIEWPORT_DIMENSION / paths.width;
    paths.stack = paths.stack.map((segment) => this.scaleSegment(segment, (xRatio > yRatio) ? yRatio : xRatio));
    return paths;
  }

  private parsePictureToDrawnPaths(picture: PictureWord, exportPath?: string): DrawingSequence {
    const filePath = picture.uploadedPicturePath as string;
    const svg = fs.readFileSync(filePath).toString();
    const strippedSvg = svg.replace(/[\n\t]/g, '');
    const layers = strippedSvg.split('><');

    let convertedSVGFile: string = `${layers[0]}>`;

    let width: number = 0;
    let height: number = 0;
    const paths: { layer: number; data: string }[] = [];

    layers.forEach((layer, layerIndex) => {
      if (layerIndex !== 0) {
        const curvesData = this.getDataFromSvg('d', layer);
        const curves = curvesData.split('C');

        let currentPath: string = '';
        curves.forEach((curve, curveIndex) => {
          // first curve is always M x y
          if (curveIndex === 0) {
            currentPath = curve;
          } else {
            // end current segment and start a new one
            if (curve.includes('M')) {
              const lastCurve = curve.split('M');
              const controlPoints = lastCurve[0].trimStart().split(' ');
              currentPath += this.bezierToLines(controlPoints).replace(',', 'z');
              paths.push({ layer: layerIndex, data: currentPath });
              currentPath = `M${lastCurve[1]}`;
            } else {
              // update current segment
              const coords = curve.trimStart().split(' ');
              currentPath += this.bezierToLines(coords);

              // if last curve of layer end current segment
              if (curveIndex === curves.length - 1) {
                currentPath += 'z';
                paths.push({ layer: layerIndex, data: currentPath });
              }
            }
          }
        });
      } else {
        width = Number.parseInt(this.getDataFromSvg('width', layer), 10);
        height = Number.parseInt(this.getDataFromSvg('height', layer), 10);
      }
    });

    const segments: Segment[] = [];
    paths.forEach((path) => {
      segments.push({
        zIndex: path.layer,
        brushInfo: { color: picture.color as string, strokeWidth: 1 },
        path: this.toCoordArray(path.data)
      });
      convertedSVGFile += `\n<path stroke="${picture.color}" fill="none" d="${path.data}"/>`;
    });
    convertedSVGFile += '\n</svg>';

    if (exportPath) {
      fs.writeFile(fsPath.resolve(exportPath), convertedSVGFile, (err) => {
        if (!err) {
          console.log(`picture exported succesfully to : ${exportPath}`);
        }
      });
    }
    return {
      height,
      width,
      stack: segments,
    };
  }

  private toCoordArray(svgData: string): Coord[] {
    const split = svgData.split(/M | L | ,/);
    const coords: Coord[] = [];
    split.forEach((values) => {
      if (values.length !== 0) {
        const coordValues = values.split(' ');
        coords.push({
          x: Number.parseFloat(coordValues[0]),
          y: Number.parseFloat(coordValues[1])
        });
      }
    });
    return coords;
  };

  private getDataFromSvg(fieldName: string, svgNode: string): string {
    const selector = `${fieldName}="`;
    const start = svgNode.indexOf(selector) + selector.length;
    const end = svgNode.indexOf('"', start);
    return svgNode.substring(start, end);
  }

  private getLeftMost(path: Coord[]): number {
    return this.minOf(path, true);
  }

  private getTopMost(path: Coord[]): number {
    return this.minOf(path, false);
  }

  private getCenterMost(path: Coord[], center: Coord): number {
    const closestToCenter = path.slice(0).sort((a, b) => this.distanceBetween(a, center) - this.distanceBetween(b, center))[0];
    return this.distanceBetween(closestToCenter, center);
  }

  private distanceBetween(coord1: Coord, coord2: Coord): number {
    return ((coord2.x - coord1.x) * (coord2.x - coord1.x)) + ((coord2.y - coord1.y) * (coord2.y - coord1.y));
  }

  private toSegment(path: Path): Segment {
    return {
      zIndex: path.id,
      brushInfo: path.brushInfo ? path.brushInfo : DEFAULT_BRUSH_INFO,
      path: path.path
    };
  }

  private scaleSegment(segment: Segment, factor: number): Segment {
    return {
      zIndex: segment.zIndex,
      brushInfo: segment.brushInfo,
      path: segment.path.map((coord) => {
        return {
          x: Math.round(((coord.x * factor) + Number.EPSILON) * ROUND_PRECISION_FACTOR) / ROUND_PRECISION_FACTOR,
          y: Math.round(((coord.y * factor) + Number.EPSILON) * ROUND_PRECISION_FACTOR) / ROUND_PRECISION_FACTOR
        };
      })
    };
  }

  // math is here https://javascript.info/bezier-curve
  private bezierToLines(controlPoints: string[]): string {

    const points: number[] = controlPoints.map((point) => Number.parseFloat(point));

    const precision = this.getBezierPrecision(points);

    let lines: string = '';
    let t = 1 / precision;
    while (t < 1) {
      const x
        = ((1 - t) * (1 - t)) * points[X1]
        + (2 * (1 - t)) * t * points[X2]
        + (t * t) * points[X3];

      const y
        = ((1 - t) * (1 - t)) * points[Y1]
        + 2 * (1 - t) * t * points[Y2]
        + (t * t) * points[Y3];

      lines += `L ${x} ${y}, `;
      t += 1 / precision;
    }
    return lines;
  }

  private getBezierPrecision(points: number[]): number {
    const derivativeStart: Coord = this.derivativeAt(points, 0);
    const derivativeEnd: Coord = this.derivativeAt(points, 1);
    const curveDistance = this.distanceBetween(derivativeStart, derivativeEnd);

    const nbOfPoints = Math.floor(curveDistance / BEZIER_PRECICION_STEP);
    const finalPrecision = nbOfPoints <= BEZIER_PRECICION_STEP - 2 ? nbOfPoints + 2 : BEZIER_PRECISION_MAXIMUM;
    return finalPrecision;
  }

  private derivativeAt(points: number[], t: number): Coord {
    return {
      x: (2 * (1 - t) * (points[X2] - points[X1])) + (2 * t * (points[X3] - points[X2])),
      y: (2 * (1 - t) * (points[X2] - points[X1])) + (2 * t * (points[X3] - points[X2])),
    };
  }

  private minOf(coords: Coord[], useX: boolean): number {
    // tweaked from https://stackoverflow.com/questions/4020796/finding-the-max-value-of-an-attribute-in-an-array-of-objects
    const coord = coords.reduce((a, b) => (useX ? a.x : a.y) < (useX ? b.x : b.y) ? a : b);
    return useX ? coord.x : coord.y;
  }

}