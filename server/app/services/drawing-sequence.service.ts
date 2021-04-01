import { injectable } from 'inversify';
import { PictureWord } from '../../models/schemas/picture-word-pair';
import { DrawingSequence } from '../../../common/communication/drawing-sequence';


@injectable()
export class DrawingSequenceService {

  sequence(pictureWord: PictureWord): DrawingSequence {
    return {
      stack: []
    };
  }

}