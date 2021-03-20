import fs from 'fs';
import path from 'path';
import { INTERNAL_SERVER_ERROR, OK, UNSUPPORTED_MEDIA_TYPE } from 'http-status-codes';
import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';
import avatarModel, { Avatar, ContentType } from '../../models/schemas/avatar';
import { DatabaseService, Response } from './database.service';
interface PublicAvatar {
  avatar: {
    data: Buffer;
    contentType: ContentType;
  };
}

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

  async getAvatar(avatarId: string): Promise<Response<PublicAvatar>> {
    return new Promise<Response<PublicAvatar>>((resolve, reject) => {
      let contentType: ContentType | undefined;
      avatarModel.findById(new ObjectId(avatarId))
        .then(async (avatar: Avatar) => {
          switch (path.extname(avatar.filePath)) {
            case '.jpg':
              contentType = ContentType.jpeg;
              break;
            case '.png':
              contentType = ContentType.png;
              break;
          }
          return this.readAvatarFile(avatar.filePath);
        })
        .then((data: Buffer) => {
          if (!contentType) throw new Error(UNSUPPORTED_MEDIA_TYPE.toString());
          const publicAvatar: PublicAvatar = { avatar: { data, contentType } };
          resolve({ statusCode: OK, documents: publicAvatar });
        })
        .catch((err) => {
          reject(DatabaseService.rejectErrorMessage(err));
        });
    });
  }

  async readAvatarFile(filePath: string): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (err) reject(INTERNAL_SERVER_ERROR);
        resolve(data);
      });
    });
  }
}