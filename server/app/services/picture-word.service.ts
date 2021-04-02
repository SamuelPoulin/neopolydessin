import fs from 'fs';
import { INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from 'http-status-codes';
import { inject, injectable } from 'inversify';
import potrace from 'potrace';
import Types from '../types';
import { PictureWordDrawing, PictureWordPicture } from '../../../common/communication/picture-word';
import pictureWordModel, { PictureWord } from '../../models/schemas/picture-word-pair';
import { DrawingSequence } from '../../../common/communication/drawing-sequence';
import { DatabaseService, Response } from './database.service';
import { DrawingSequenceService } from './drawing-sequence.service';

const PICTURE_WORD_PATH: string = '/var/www/Polydessin/picture';
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
      // const file = fs.readFileSync(path.resolve('C:/Users/mort_/Pictures/stealin.png'));
      // const uploadedPicture: Buffer = Buffer.from(file);
      const uploadedPicture: Buffer = Buffer.from(body.picture);
      this.posterizePromise(uploadedPicture, body.color)
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

  async getRandomWord(): Promise<PictureWord> {
    return new Promise<PictureWord>((resolve, reject) => {
      pictureWordModel.countDocuments()
        .then((count) => {
          const random = Math.floor(Math.random() * count);
          return pictureWordModel.findOne().skip(random);
        })
        .then((pictureWord) => {
          if (!pictureWord) throw new Error(NOT_FOUND.toString());
          resolve(pictureWord);
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

  async posterizePromise(picture: Buffer, color: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      potrace.posterize(picture, { color }, (err, result) => {
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

}