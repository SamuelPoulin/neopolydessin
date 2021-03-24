import { Document, Schema, model, ObjectId, Model } from 'mongoose';
import { Path } from '../../models/commands/path';
import { DrawMode } from '../../../common/communication/draw-mode';
import { PictureWordDrawing, PictureWordPicture } from '../../../common/communication/picture-word';
import { Difficulty } from '../../../common/communication/lobby';

export interface PictureWord extends Document {
  _id: ObjectId;
  word: string;
  uploadedPicturePath?: string;
  drawnPaths?: Path[];
  hints: string[];
  difficulty: Difficulty;
  drawMode: DrawMode;
}

interface PictureWordModel extends Model<PictureWord> {
  uploadPicture: (info: PictureWordPicture) => Promise<PictureWord>;
  uploadDrawing: (info: PictureWordDrawing) => Promise<PictureWord>;
}

export const pictureWordSchema = new Schema<PictureWord, PictureWordModel>({
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
        path: [{ x: Number, y: Number }],
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

pictureWordSchema.statics.uploadPicture = async (info: PictureWordPicture) => {
  const toSave = new pictureWordModel(info);
  return toSave.save();
};

pictureWordSchema.statics.uploadDrawing = async (info: PictureWordDrawing) => {
  const toSave = new pictureWordModel(info);
  return toSave.save();
};


const pictureWordModel = model<PictureWord, PictureWordModel>('PictureWord', pictureWordSchema);
export default pictureWordModel;