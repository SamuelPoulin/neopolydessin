import { NOT_FOUND, OK } from 'http-status-codes';
import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';
import avatarModel, { Avatar } from '../../models/schemas/avatar';
import { DatabaseService, Response } from './database.service';
interface AvatarId {
  id: string;
}

@injectable()
export class AvatarService {

  async upload(accountId: string, filePath: string): Promise<Response<AvatarId>> {
    return new Promise<Response<AvatarId>>((resolve, reject) => {
      avatarModel.uploadAvatarForUser(accountId, filePath)
        .then((result: Avatar) => {
          resolve({ statusCode: OK, documents: { id: result._id.toHexString() } });
        })
        .catch((err) => {
          reject(DatabaseService.rejectErrorMessage(err));
        });
    });
  }

  async getAvatar(avatarId: string): Promise<Response<string>> {
    return new Promise<Response<string>>((resolve, reject) => {
      avatarModel.findById(new ObjectId(avatarId))
        .then(async (avatar: Avatar) => {
          if (!avatar.filePath) throw new Error(NOT_FOUND.toString());
          resolve({ statusCode: OK, documents: avatar.filePath });
        })
        .catch((err) => {
          reject(DatabaseService.rejectErrorMessage(err));
        });
    });
  }
}