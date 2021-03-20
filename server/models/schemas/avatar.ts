import { ObjectId } from 'mongodb';
import { Document, Schema, model, Model, Query } from 'mongoose';

export enum ContentType {
  png = 'image/png',
  jpeg = 'image/jpeg'
}

interface AvatarModel extends Model<Avatar> {
  addAvatarDocument: (accountId: string) => Promise<Avatar>;
  removeAvatar: (accountId: string) => Query<Avatar | null, Avatar>;
  uploadAvatarForUser: (accountId: string, filePath: string) => Query<Avatar | null, Avatar>;
}

export interface Avatar extends Document {
  _id: ObjectId;
  filePath: string;
}

export const avatarSchema = new Schema<Avatar, AvatarModel>({
  accountId: String,
  filePath: String
});

avatarSchema.statics.uploadAvatarForUser = (accountId: string, filePath: string) => {
  const update = {
    accountId,
    filePath
  };
  return avatarModel.findOneAndUpdate(
    { accountId },
    update,
    {
      useFindAndModify: false,
      returnOriginal: false
    }
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