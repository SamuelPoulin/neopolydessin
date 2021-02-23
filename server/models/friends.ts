import * as mongoose from 'mongoose';

export enum FriendStatus {
  PENDING = 'pending',
  FRIEND = 'friend'
}

export interface Friend {
  accountId: string;
  status: FriendStatus;
  username: string;
}

export interface Friends extends mongoose.Document {
  _id: string;
  accountId: string;
  friends: [Friend];
}

// for many to many relationship
export const friendsSchema = new mongoose.Schema({
  accountId: {
    type: String,
    required: true,
    unique: true
  },
  friends: [{
    accountId: String,
    status: {
      type: String,
      enum: [FriendStatus.PENDING, FriendStatus.FRIEND],
      default: FriendStatus.PENDING
    },
    username: String,
  }],
});

const friendsModel = mongoose.model<Friends>('Friends', friendsSchema);
export default friendsModel;
