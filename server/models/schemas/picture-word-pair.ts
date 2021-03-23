import { Path } from 'models/commands/path';
import { Difficulty } from 'models/lobby';
import { Document, Schema, model, ObjectId } from 'mongoose';
import { DrawMode } from '../../../common/communication/draw-mode';

export interface PictureWord extends Document {
  _id: ObjectId;
  word: string;
  uploadedPicturePath?: string;
  drawnPaths?: [Path];
  hints: [string];
  difficulty: Difficulty;
  drawMode: DrawMode;
}

export const pictureWordSchema = new Schema<PictureWord>({
  word: {
    type: String,
    required: true,
  },
  uploadedPicturePath: {
    type: String,
    required: false,
  },
  drawnPaths: {
    type: [
      {
        id: Number,
        path: [
          {
            x: Number,
            y: Number
          }
        ],
        brushInfo: {
          color: String,
          strokeWidth: Number
        }
      }
    ],
    required: false
  },
  hints: [String],
  difficulty: {
    type: String,
    enum: [Difficulty.EASY, Difficulty.INTERMEDIATE, Difficulty.HARD],
    default: Difficulty.INTERMEDIATE
  },
  drawMode: {
    type: String,
    enum: [DrawMode.CONVENTIONAL, DrawMode.RANDOM, DrawMode.PANORAMIC, DrawMode.CENTER_FIRST],
    default: DrawMode.CONVENTIONAL
  }
});

const pictureWordModel = model<PictureWord>('PictureWord', pictureWordSchema);
export default pictureWordModel;