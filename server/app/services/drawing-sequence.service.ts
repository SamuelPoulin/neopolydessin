import { injectable } from 'inversify';
import { DEFAULT_BRUSH_INFO, Path } from '../../models/commands/path';
import { PictureWord } from '../../models/schemas/picture-word-pair';
import { DrawingSequence, Segment } from '../../../common/communication/drawing-sequence';
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
        stack = paths.map((path) => {
          return {
            brushInfo: path.brushInfo ? path.brushInfo : DEFAULT_BRUSH_INFO,
            path: path.path
          };
        });
        break;
      case DrawMode.CENTER_FIRST:
        break;
      case DrawMode.RANDOM:
        break;
      case DrawMode.PAN_B_TO_T:
        break;
      case DrawMode.PAN_T_TO_B:
        break;
      case DrawMode.PAN_L_TO_R:
        break;
      case DrawMode.PAN_R_TO_L:
        break;

    }
    return { stack };
  }

}