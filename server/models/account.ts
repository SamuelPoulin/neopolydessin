import { ObjectId } from 'mongodb';
import * as mongoose from 'mongoose';

export enum FriendStatus {
  PENDING = 'pending',
  FRIEND = 'friend'
}

export interface Friend {
  friendId: string;
  status: FriendStatus;
  received: boolean;
}

export interface FriendsList {
  friends: {
    friendId: string;
    username: string;
    status: FriendStatus;
    received: boolean;
  }[];
}

export interface Account extends mongoose.Document {
  _id: ObjectId;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  friends: [Friend];
  logins: string;
}

export const accountSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  logins: {
    type: ObjectId, ref: 'Logins'
  },
  friends: [
    {
      friendId: String,
      status: {
        type: String,
        enum: [FriendStatus.PENDING, FriendStatus.FRIEND],
        default: FriendStatus.PENDING
      },
      received: Boolean,
    }],
});

const accountModel = mongoose.model<Account>('Account', accountSchema);
export default accountModel;
