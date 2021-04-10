import fs from 'fs';
import { INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from 'http-status-codes';
import { inject, injectable } from 'inversify';
import potrace from 'potrace';
import { ObjectId } from 'mongodb';
import Types from '../types';
import { PictureWordDrawing, PictureWordInfo, PictureWordPicture, UpdatePictureWord } from '../../../common/communication/picture-word';
import pictureWordModel, { PictureWord } from '../../models/schemas/picture-word-pair';
import { DrawingSequence } from '../../../common/communication/drawing-sequence';
import { Difficulty } from '../../../common/communication/lobby';
import { DatabaseService, Response } from './database.service';
import { DrawingSequenceService } from './drawing-sequence.service';

const PICTURE_WORD_PATH: string = '/var/www/Polydessin/picture';
interface RandomWord {
  word: string;
  hints: string[];
  difficulty: Difficulty;
  sequence: DrawingSequence;
}

@injectable()
export class PictureWordService {

  private picturePath: string;

  constructor(
    @inject(Types.DrawingSequenceService) private drawingSequenceService: DrawingSequenceService
  ) {
    this.picturePath = PICTURE_WORD_PATH;
  }

  setPicturePath(picturePath: string) {
    this.picturePath = picturePath;
    this.checkForPictureFolder();
  }

  async uploadPicture(body: PictureWordPicture): Promise<Response<string>> {
    return new Promise<Response<string>>((resolve, reject) => {
      const toSave = new pictureWordModel(body);
      const uploadedPicture: Buffer = Buffer.from(body.picture, 'base64');
      this.posterizePromise(uploadedPicture, body.color, body.threshold)
        .then(async (svg) => {
          return this.writeSVG(toSave.id, svg);
        })
        .then(async (newPath) => {
          toSave.uploadedPicturePath = newPath;
          return toSave.save();
        })
        .then((picture) => {
          resolve({ statusCode: OK, documents: picture.id });
        })
        .catch((err) => {
          reject(DatabaseService.rejectErrorMessage(err));
        });
    });

  }

  async uploadDrawing(body: PictureWordDrawing): Promise<Response<void>> {
    return new Promise<Response<void>>((resolve, reject) => {
      pictureWordModel.uploadDrawing(body)
        .then((drawing) => {
          resolve({ statusCode: OK, documents: drawing.id });
        })
        .catch((err: Error) => {
          reject(DatabaseService.rejectErrorMessage(err));
        });
    });
  }

  async updatePictureWord(id: string, body: UpdatePictureWord): Promise<Response<DrawingSequence>> {
    return new Promise<Response<DrawingSequence>>((resolve, reject) => {
      pictureWordModel.findByIdAndUpdate(new ObjectId(id), body, { useFindAndModify: false })
        .then(async (pictureWord: PictureWord) => {
          return this.getSequenceToDraw(pictureWord.id);
        })
        .then((sequence) => {
          resolve(sequence);
        })
        .catch((err) => {
          reject(DatabaseService.rejectErrorMessage(err));
        });
    });
  }

  async getPictureWords(page: number, limit: number): Promise<Response<PictureWordInfo[]>> {
    return new Promise<Response<PictureWordInfo[]>>((resolve, reject) => {
      const skips = limit * (page - 1);
      pictureWordModel.find().skip(skips).limit(limit)
        .then((pictureWords: PictureWord[]) => {
          const infos = pictureWords.map((pictureWord) => this.pictureWordToPictureWordInfo(pictureWord));
          resolve({ statusCode: OK, documents: infos });
        })
        .catch((err: Error) => {
          reject(DatabaseService.rejectErrorMessage(err));
        });
    });
  }

  async getSequenceToDraw(id: string): Promise<Response<DrawingSequence>> {
    return new Promise<Response<DrawingSequence>>((resolve, reject) => {
      pictureWordModel.findById(id)
        .then((found) => {
          if (!found) throw new Error(NOT_FOUND.toString());
          const sequence = this.drawingSequenceService.sequence(found);
          resolve({ statusCode: OK, documents: sequence });
        })
        .catch((err) => {
          reject(DatabaseService.rejectErrorMessage(err));
        });

    });
  }

  async deletePictureWord(id: string): Promise<Response<PictureWord>> {
    return new Promise<Response<PictureWord>>((resolve, reject) => {
      pictureWordModel.findByIdAndDelete(id)
        .then((deleted) => {
          if (!deleted) throw new Error(NOT_FOUND.toString());
          resolve({ statusCode: OK, documents: deleted });
        })
        .catch((err) => {
          reject(DatabaseService.rejectErrorMessage(err));
        });
    });
  }

  async getRandomWord(difficulty: Difficulty): Promise<RandomWord> {
    return new Promise<RandomWord>((resolve, reject) => {
      pictureWordModel.countDocuments({ difficulty })
        .then((count) => {
          const random = Math.floor(Math.random() * count);
          return pictureWordModel.findOne({ difficulty }).skip(random);
        })
        .then((pictureWord) => {
          if (!pictureWord) throw new Error(NOT_FOUND.toString());
          const drawingSequence = this.drawingSequenceService.sequence(pictureWord);
          resolve({
            word: pictureWord.word,
            hints: pictureWord.hints,
            difficulty: pictureWord.difficulty,
            sequence: drawingSequence,
          });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async writeSVG(fileName: string, svg: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const filePath = `${this.picturePath}/${fileName}.svg`;
      fs.writeFile(filePath, svg, {}, (err) => {
        if (err) reject('failed to store picture');
        resolve(filePath);
      });
    });
  }

  async posterizePromise(picture: Buffer, color: string, threshold?: number): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      potrace.posterize(picture, { color, threshold }, (err, result) => {
        if (err) throw new Error(INTERNAL_SERVER_ERROR.toString());
        resolve(result);
      });
    });
  }

  private checkForPictureFolder(): void {
    if (!fs.existsSync(this.picturePath)) {
      try {
        fs.mkdirSync(this.picturePath, { recursive: true });
      }
      catch (e) {
        console.error(e);
      }
    }
  }

  private pictureWordToPictureWordInfo(pictureWord: PictureWord): PictureWordInfo {
    return {
      _id: pictureWord.id,
      word: pictureWord.word,
      drawMode: pictureWord.drawMode,
      difficulty: pictureWord.difficulty
    };
  }

}