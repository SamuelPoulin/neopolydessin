import fs from 'fs';
import { INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from 'http-status-codes';
import { injectable } from 'inversify';
import potrace from 'potrace';
import { PictureWordDrawing, PictureWordPicture } from '../../../common/communication/picture-word';
import pictureWordModel, { PictureWord } from '../../models/schemas/picture-word-pair';
import { DatabaseService, Response } from './database.service';
@injectable()
export class PictureWordService {

  readonly PICTURE_WORD_PATH: string = 'var/www/Polydessin/picture';

  async uploadPicture(body: PictureWordPicture): Promise<Response<void>> {
    return new Promise<Response<void>>((resolve, reject) => {
      const toSave = new pictureWordModel(body);
      const uploadedPicture: Buffer = Buffer.from(body.picture);
      this.posterizePromise(uploadedPicture, body.color)
        .then(async (svg) => {
          return this.writeSVG(toSave.id, svg);
        })
        .then(async (path) => {
          toSave.uploadedPicturePath = path;
          return toSave.save();
        })
        .then((picture) => {
          resolve({ statusCode: OK, documents: undefined });
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
          resolve({ statusCode: OK, documents: undefined });
        })
        .catch((err: Error) => {
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
      const filePath = `${this.PICTURE_WORD_PATH}/${fileName}.svg`;
      fs.writeFile(filePath, svg, {}, (err) => {
        if (err) reject('failed to store picture');
        resolve(filePath);
      });
    });
  }

  async posterizePromise(picture: Buffer, color: string): Promise<string> {
    return new Promise<string>((reject, resolve) => {
      potrace.posterize(picture, { color }, (err, result) => {
        if (err) throw new Error(INTERNAL_SERVER_ERROR.toString());
        resolve(result);
      });
    });
  }
}