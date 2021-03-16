import { ObjectId } from 'mongodb';
import { Document, Schema, model, Model, Query } from 'mongoose';

export enum ContentType {
  png = 'image/png',
  jpeg = 'image/jpeg'
}

interface AvatarModel extends Model<Avatar> {
  addAvatarDocument: (accountId: string) => Promise<Avatar>;
  removeAvatar: (accountId: string) => Query<Avatar | null, Avatar>;
  uploadAvatarForUser: (accountId: string, data: Buffer, contentType: ContentType) => Query<Avatar | null, Avatar>;
}

export interface Avatar extends Document {
  _id: ObjectId;
  accountId: string;
  avatar: {
    data: Buffer;
    contentType: ContentType;
  } | undefined;
}

export const avatarSchema = new Schema<Avatar, AvatarModel>({
  accountId: String,
  avatar: {
    data: Buffer,
    contentType: {
      type: String,
      enum: [ContentType.png, ContentType.jpeg]
    }
  }
});

avatarSchema.statics.uploadAvatarForUser = (accountId: string, body: Buffer, contentType: ContentType) => {
  const update = {
    accountId,
    avatar: {
      data: body,
      contentType
    }
  };
  return avatarModel.findOneAndUpdate(
    { accountId },
    update,
    { useFindAndModify: false }
  );
};

avatarSchema.statics.addAvatarDocument = async (accountId: string) => {
  const avatarDoc = new avatarModel({
    accountId,
  });
  return avatarDoc.save();
};

avatarSchema.statics.removeAvatar = (accountId: string) => {
  return avatarModel.remove({ accountId });
};

const avatarModel = model<Avatar, AvatarModel>('Avatar', avatarSchema);
export default avatarModel;