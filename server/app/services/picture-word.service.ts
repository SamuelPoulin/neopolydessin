import { OK } from 'http-status-codes';
import { injectable } from 'inversify';
import pictureWordModel from 'models/schemas/picture-word-pair';
import { PictureWordDrawing } from '../../../common/communication/picture-word';
import { DatabaseService, Response } from './database.service';

@injectable()
export class PictureWordService {

  // async uploadPicture(accountId: string, filePath: string): Promise<Response<void>> {
  //   return new Promise<Response<void>>((resolve, reject) => {
  //     pictureWordModel.uplo(accountId, filePath)
  //       .then((result: Avatar) => {
  //         resolve({ statusCode: OK, documents: { id: result._id.toHexString() } });
  //       })
  //       .catch((err) => {
  //         reject(DatabaseService.rejectErrorMessage(err));
  //       });
  //   });
  // }

  async uploadDrawing(body: PictureWordDrawing): Promise<Response<void>> {
    return new Promise<Response<void>>((resolve, reject) => {
      pictureWordModel.uploadDrawing(body)
        .then((pictureWord) => {
          console.log(pictureWord);
          resolve({ statusCode: OK, documents: undefined });
        })
        .catch((err: Error) => {
          reject(DatabaseService.rejectErrorMessage(err));
        });
    });
  }

}