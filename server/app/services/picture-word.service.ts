import { OK } from 'http-status-codes';
import { injectable } from 'inversify';
import { PictureWordDrawing, PictureWordPicture } from '../../../common/communication/picture-word';
import pictureWordModel from '../../models/schemas/picture-word-pair';
import { DatabaseService, Response } from './database.service';

@injectable()
export class PictureWordService {

  async uploadPicture(body: PictureWordPicture): Promise<Response<void>> {
    return new Promise<Response<void>>((resolve, reject) => {
      pictureWordModel.uploadPicture(body)
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

}