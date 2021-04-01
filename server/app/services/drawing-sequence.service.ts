import { injectable } from 'inversify';
import { DEFAULT_BRUSH_INFO, Path } from '../../models/commands/path';
import { PictureWord } from '../../models/schemas/picture-word-pair';
import { Coord, DrawingSequence, Segment } from '../../../common/communication/drawing-sequence';
import { DrawMode } from '../../../common/communication/draw-mode';

@injectable()
export class DrawingSequenceService {

  sequence(pictureWord: PictureWord): DrawingSequence {
    return pictureWord.uploadedPicturePath
      ? this.sequencePicture(pictureWord)
      : this.sequenceDrawing(pictureWord);
  }

  sequencePicture(picture: PictureWord): DrawingSequence {
    return {
      stack: []
    };
  }

  sequenceDrawing(drawing: PictureWord): DrawingSequence {
    const paths = drawing.drawnPaths as Path[];

    let stack: Segment[] = [];

    switch (drawing.drawMode) {

      case DrawMode.CONVENTIONAL:
        stack = paths.map((path) => this.toSegment(path));
        break;

      case DrawMode.CENTER_FIRST:
        const center = this.findCenterPointOfDrawing(paths);
        stack = paths
          .sort((a, b) => this.getCenterMost(a.path, center) - this.getCenterMost(b.path, center))
          .map((path) => this.toSegment(path));
        break;

      case DrawMode.RANDOM:
        while (paths.length > 0) {
          const randomIndex = Math.floor(Math.random() * paths.length);
          const randomPath = paths.splice(randomIndex, 1)[0];
          stack.push(this.toSegment(randomPath));
        }
        break;

      case DrawMode.PAN_B_TO_T:
        stack = paths
          .sort((a, b) => this.getTopMost(b.path) - this.getTopMost(a.path))
          .map((path) => this.toSegment(path));
        break;

      case DrawMode.PAN_T_TO_B:
        stack = paths
          .sort((a, b) => this.getTopMost(a.path) - this.getTopMost(b.path))
          .map((path) => this.toSegment(path));
        break;

      case DrawMode.PAN_L_TO_R:
        stack = paths
          .sort((a, b) => this.getLeftMost(a.path) - this.getLeftMost(b.path))
          .map((path) => this.toSegment(path));
        break;

      case DrawMode.PAN_R_TO_L:
        stack = paths
          .sort((a, b) => this.getLeftMost(b.path) - this.getLeftMost(a.path))
          .map((path) => this.toSegment(path));
        break;
    }
    return { stack };
  }

  private getLeftMost(path: Coord[]): number {
    return this.minOf(path, true);
  }

  private getTopMost(path: Coord[]): number {
    return this.minOf(path, false);
  }

  private getCenterMost(path: Coord[], center: Coord): number {
    const closestToCenter = path.sort((a, b) => this.distanceBetween(a, center) - this.distanceBetween(b, center))[0];
    return this.distanceBetween(closestToCenter, center);
  }

  private distanceBetween(coord1: Coord, coord2: Coord): number {
    return ((coord2.x - coord1.x) * (coord2.x - coord1.x)) + ((coord2.y - coord1.y) * (coord2.y - coord1.y));
  }

  private findCenterPointOfDrawing(paths: Path[]): Coord {
    let allCoords: Coord[] = [];
    paths.forEach((path) => {
      allCoords = allCoords.concat(allCoords, path.path);
    });
    const maxX = this.maxOf(allCoords, true);
    const maxY = this.maxOf(allCoords, false);
    return { x: maxX / 2, y: maxY / 2 };
  }

  private toSegment(path: Path): Segment {
    return {
      brushInfo: path.brushInfo ? path.brushInfo : DEFAULT_BRUSH_INFO,
      path: path.path
    };
  }

  private maxOf(coords: Coord[], useX: boolean): number {
    // tweaked from https://stackoverflow.com/questions/4020796/finding-the-max-value-of-an-attribute-in-an-array-of-objects
    const coord = coords.reduce((a, b) => (useX ? a.x : a.y) > (useX ? b.x : b.y) ? a : b);
    return useX ? coord.x : coord.y;
  }

  private minOf(coords: Coord[], useX: boolean): number {
    // tweaked from https://stackoverflow.com/questions/4020796/finding-the-max-value-of-an-attribute-in-an-array-of-objects
    const coord = coords.reduce((a, b) => (useX ? a.x : a.y) < (useX ? b.x : b.y) ? a : b);
    return useX ? coord.x : coord.y;
  }

}