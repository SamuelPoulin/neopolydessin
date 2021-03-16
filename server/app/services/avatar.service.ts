import { INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';
import { injectable } from 'inversify';
import avatarModel, { Avatar, ContentType } from '../../models/schemas/avatar';
import { DatabaseService, Response } from './database.service';

interface PublicAvatar {
  avatar: {
    data: Buffer;
    contentType: ContentType;
  };
}

@injectable()
export class AvatarService {

  async upload(accountId: string, body: Buffer, contentType: ContentType): Promise<Response<PublicAvatar>> {
    return new Promise<Response<PublicAvatar>>((resolve, reject) => {
      avatarModel.uploadAvatarForUser(accountId, body, contentType)
        .then((result: Avatar) => {
          if (!result.avatar) throw new Error(INTERNAL_SERVER_ERROR.toString());
          const publicAvatar: PublicAvatar = { avatar: result.avatar };
          resolve({ statusCode: OK, documents: publicAvatar });
        })
        .catch((err) => {
          reject(DatabaseService.rejectErrorMessage(err));
        });
    });
  }
}