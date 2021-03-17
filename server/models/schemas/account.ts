import { ObjectId } from 'mongodb';
import { Document, Model, model, Query, Schema } from 'mongoose';

export enum FriendStatus {
  PENDING = 'pending',
  FRIEND = 'friend'
}

export interface FriendWithConnection extends Friend {
  isOnline: boolean;
}

interface Friend {
  friendId: string | {
    _id: string;
    username: string;
  } | null;
  status: FriendStatus;
  received: boolean;
}

export interface FriendsList {
  friends: FriendWithConnection[];
}
export interface Account extends Document {
  _id: ObjectId;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  friends: [Friend];
  logins: string;
}

export interface UpdateOneQueryResult {
  ok: number;
  n: number;
  nModified: number;
}
interface AccountModel extends Model<Account> {
  getUsersInfo: (ids: string[]) => Query<Account[] | null, Account>;
  getFriends: (id: string) => Query<FriendsList | null, Account>;
  addFriendRequestToAccountWithUsername: (senderId: string, username: string) => Query<Account | null, Account>;
  addFriendrequestToSenderWithId: (senderId: string, receiverId: string) => Query<Account | null, Account>;
  acceptFriendship: (id: string, otherId: string, receivedOffer: boolean) => Query<UpdateOneQueryResult, Account>;
  refuseFriendship: (id: string, otherId: string, receivedOffer: boolean) => Query<UpdateOneQueryResult, Account>;
  unfriend: (id: ObjectId, otherId: ObjectId) => Query<UpdateOneQueryResult, Account>;
}

export const accountSchema = new Schema<Account, AccountModel>({
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

accountSchema.statics.getUsersInfo = (ids: string[]) => {
  const objectIds: ObjectId[] = ids.map((id) => new ObjectId(id));
  return accountModel.find(
    {
      _id: { $in: objectIds }
    }
  );
};

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

accountSchema.statics.getFriends = (id: string) => {
  return accountModel
    .aggregate([
      {
        $match: { _id: new ObjectId(id) }
      },
      {
        $lookup: {
          from: 'refreshes',
          localField: 'friends.friendId',
          foreignField: 'accountId',
          as: 'refreshToken'
        }
      },
      {
        $unwind: { path: '$friends', preserveNullAndEmptyArrays: true }
      },
      {
        $addFields: {
          'friends.indexOfRefresh': {
            $indexOfArray: [
              '$refreshToken.accountId',
              '$friends.friendId'
            ]
          }
        }
      },
      {
        $addFields: {
          'friends.isOnline': {
            $cond: {
              if: { $eq: ['$friends.indexOfRefresh', -1] },
              then: false,
              else: true
            }
          }
        }
      },
      {
        $group: {
          _id: '$_id',
          friends: {
            $push: {
              status: '$friends.status',
              received: '$friends.received',
              friendId: '$friends.friendId',
              isOnline: '$friends.isOnline'
            }
          }
        }
      }
    ]);
};

const accountModel = model<Account, AccountModel>('Account', accountSchema);
export default accountModel;
