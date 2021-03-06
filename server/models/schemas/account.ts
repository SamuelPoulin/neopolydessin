import { ObjectId } from 'mongodb';
import { Document, Model, model, Query, Schema } from 'mongoose';
import { AccountFriend } from '../../../common/communication/account';
import { FriendsList, FriendStatus } from '../../../common/communication/friends';

export interface Account extends Document {
  _id: ObjectId;
  avatar: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  friends: [AccountFriend];
  logins: string;
  gameHistory: string;
  createdDate: number;
}

export interface UpdateOneQueryResult {
  ok: number;
  n: number;
  nModified: number;
}
interface AccountModel extends Model<Account> {
  getFriends: (id: string) => Query<FriendsList | null, Account>;
  addFriendRequestToAccountWithUsername: (senderId: string, username: string) => Query<Account | null, Account>;
  addFriendrequestToSenderWithId: (senderId: string, receiverId: string) => Query<Account | null, Account>;
  acceptFriendship: (id: string, otherId: string, receivedOffer: boolean) => Query<UpdateOneQueryResult, Account>;
  refuseFriendship: (id: string, otherId: string, receivedOffer: boolean) => Query<UpdateOneQueryResult, Account>;
  unfriend: (id: ObjectId, otherId: ObjectId) => Query<UpdateOneQueryResult, Account>;
}

export const accountSchema = new Schema<Account, AccountModel>({
  avatar: {
    type: ObjectId, ref: 'Avatar'
  },
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
    type: Number,
    default: Date.now
  },
  logins: {
    type: ObjectId, ref: 'Logins'
  },
  gameHistory: {
    type: ObjectId, ref: 'GameHistory'
  },
  friends: [
    {
      _id: false,
      friendId: String,
      status: {
        type: String,
        enum: [FriendStatus.PENDING, FriendStatus.FRIEND],
        default: FriendStatus.PENDING
      },
      received: Boolean,
    }],
});

accountSchema.statics.addFriendRequestToAccountWithUsername = (senderId: string, username: string) => {
  return accountModel.findOneAndUpdate(
    {
      '_id': { $ne: senderId },
      username,
      'friends.friendId': { $ne: senderId }
    },
    {
      $push:
      {
        friends:
        {
          friendId: senderId,
          status: FriendStatus.PENDING,
          received: true
        }
      }
    },
    {
      useFindAndModify: false
    }
  );
};

accountSchema.statics.addFriendrequestToSenderWithId = (senderId: string, receiverId: string) => {
  return accountModel.findOneAndUpdate(
    {
      '_id': senderId,
      'friends.friendId': { $ne: receiverId }
    },
    {
      $push: {
        friends: {
          friendId: receiverId,
          status: FriendStatus.PENDING,
          received: false
        }
      }
    },
    {
      useFindAndModify: false
    }
  );
};

accountSchema.statics.acceptFriendship = (id: string, otherId: string, receivedOffer: boolean) => {
  return accountModel.updateOne(
    {
      '_id': id,
      'friends.friendId': otherId,
      'friends.status': FriendStatus.PENDING,
      'friends.received': receivedOffer
    },
    {
      $set:
      {
        'friends.$.status':
          FriendStatus.FRIEND
      }
    }
  );
};

accountSchema.statics.refuseFriendship = (id: string, otherId: string, receivedOffer: boolean) => {
  return accountModel.updateOne(
    {
      _id: id
    },
    {
      $pull: {
        friends: {
          friendId: otherId,
          status: FriendStatus.PENDING,
          received: receivedOffer
        }
      }
    }
  );
};

accountSchema.statics.unfriend = (id: string, otherId: string) => {
  return accountModel.updateOne(
    {
      _id: id
    },
    {
      $pull: {
        friends: {
          friendId: otherId,
          status: FriendStatus.FRIEND
        }
      }
    }
  );
};

const accountModel = model<Account, AccountModel>('Account', accountSchema);
export default accountModel;
