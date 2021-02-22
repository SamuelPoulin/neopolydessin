import * as mongoose from 'mongoose';

export interface Friend {
  accountId: string;
  username: string;
}

export interface Friends extends mongoose.Document {
  _id: string;
  accountId: string;
  friends: Friend[];
}

// for many to many relationship
export const friendsSchema = new mongoose.Schema({
  accountId: {
    type: String,
    required: true,
    unique: true
  }
});

const friendsModel = mongoose.model<Friends>('Friends', friendsSchema);
export default friendsModel;
