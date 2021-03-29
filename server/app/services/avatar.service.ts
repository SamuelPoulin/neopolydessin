import { NOT_FOUND, OK } from 'http-status-codes';
import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';
import avatarModel, { Avatar } from '../../models/schemas/avatar';
import { Observable } from '../utils/observable';
import { DatabaseService, Response } from './database.service';

interface AvatarId {
  id: string;
}

@injectable()
export class AvatarService {
  static USER_UPDATED_AVATAR: Observable<{ accountId: string; avatarId: string }> = new Observable();

  async upload(accountId: string, filePath: string): Promise<Response<AvatarId>> {
    return new Promise<Response<AvatarId>>((resolve, reject) => {
      avatarModel.uploadAvatarForUser(accountId, filePath)
        .then((result: Avatar) => {
          AvatarService.USER_UPDATED_AVATAR.notify({
            accountId,
            avatarId: result._id.toHexString(),
          });
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