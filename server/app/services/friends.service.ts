import { injectable } from 'inversify';
import { BAD_REQUEST, NOT_FOUND, OK } from 'http-status-codes';
import { ObjectId } from 'mongodb';
import accountModel, { Account, FriendsList, FriendStatus } from '../../models/account';
import { DatabaseService, ErrorMsg, Response } from './database.service';

@injectable()
export class FriendsService {

  async getFriendsOfUser(id: string): Promise<Response<FriendsList>> {
    return new Promise<Response<FriendsList>>((resolve, reject) => {
      accountModel.findOne({ _id: id })
        .populate('friends.friendId', 'username')
        .then((doc: Account) => {
          if (!doc) throw Error(NOT_FOUND.toString());
          const response: FriendsList = {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            friends: doc.friends.map((friend: any) => {
              return {
                friendId: friend.friendId ? friend.friendId._id : null,
                username: friend.friendId ? friend.friendId.username : null,
                status: friend.status,
                received: friend.received,
              };
            }),
          };
          resolve({ statusCode: OK, documents: response });
        })
        .catch((err: Error) => {
          reject(DatabaseService.rejectErrorMessage(err));
        });
    });
  }

  async requestFriendship(id: string, email: string): Promise<Response<FriendsList>> {
    return new Promise<Response<FriendsList>>((resolve, reject) => {
      // Add friend request to others account
      accountModel.updateOne(
        { '_id': { $ne: new ObjectId(id) }, email, 'friends.friendId': { $ne: id } },
        { $push: { friends: { friendId: id, status: FriendStatus.PENDING, received: true } } })
        .then((doc: Account) => {
          if (!doc) throw Error(BAD_REQUEST.toString());
          const friendsId: string = doc._id.toHexString();
          // TODO notify other user with socketio

          // Add friend request to this account
          return accountModel.updateOne(
            { '_id': new ObjectId(id), 'friends.friendId': { $ne: friendsId } },
            { $push: { friends: { friendId: friendsId, status: FriendStatus.PENDING, received: false } } }
          );
        })
        .then(async (doc) => {
          return this.getFriendsOfUser(id);
        })
        .then((updatedList: Response<FriendsList>) => {
          resolve(updatedList);
        })
        .catch((err: Error | ErrorMsg) => {
          reject(DatabaseService.rejectErrorMessage(err));
        });
    });
  }

  async acceptFriendship(myId: string, friendId: string): Promise<Response<FriendsList>> {
    return new Promise<Response<FriendsList>>((resolve, reject) => {
      // update friend for this account
      accountModel.updateOne(
        {
          '_id': new ObjectId(myId),
          'friends.friendId': friendId,
          'friends.status': FriendStatus.PENDING,
          'friends.received': true
        },
        { $set: { 'friends.$.status': FriendStatus.FRIEND } }
      )
        .then((doc) => {
          if (doc.nModified === 0) throw Error(BAD_REQUEST.toString());
          return accountModel.updateOne(
            {
              '_id': new ObjectId(friendId),
              'friends.friendId': myId,
              'friends.status': FriendStatus.PENDING,
              'friends.received': false
            },
            { $set: { 'friends.$.status': FriendStatus.FRIEND } }
          );
        })
        .then(async (doc: Account) => {
          return this.getFriendsOfUser(myId);
        })
        .then((updatedList: Response<FriendsList>) => {
          resolve(updatedList);
        })
        .catch((err: Error | ErrorMsg) => {
          reject(DatabaseService.rejectErrorMessage(err));
        });
    });
  }

  async refuseFriendship(myId: string, friendId: string): Promise<Response<FriendsList>> {
    return new Promise<Response<FriendsList>>((resolve, reject) => {
      // delete friend request for this account
      accountModel.updateOne(
        { _id: new ObjectId(myId) },
        { $pull: { friends: { friendId, status: FriendStatus.PENDING, received: true } } })
        .then((doc) => {
          if (doc.nModified === 0) throw Error(BAD_REQUEST.toString());
          // delete friend for others account
          return accountModel.updateOne({ _id: new ObjectId(friendId) },
            { $pull: { friends: { friendId: myId, status: FriendStatus.PENDING, received: false } } });
        })
        .then(async (doc) => {
          // TODO notify other user with socketio

          return this.getFriendsOfUser(myId);
        })
        .then((updateList: Response<FriendsList>) => {
          resolve(updateList);
        })
        .catch((err: Error | ErrorMsg) => {
          reject(DatabaseService.rejectErrorMessage(err));
        });
    });
  }

  async unfriend(id: string, toUnfriendId: string): Promise<Response<FriendsList>> {
    return new Promise<Response<FriendsList>>((resolve, reject) => {
      accountModel.updateOne({ _id: new ObjectId(id) }, { $pull: { friends: { friendId: toUnfriendId, status: FriendStatus.FRIEND } } })
        .then((doc: Account) => {
          console.log(doc);
          if (!doc) throw Error(NOT_FOUND.toString());
          return accountModel.updateOne({ _id: new ObjectId(toUnfriendId) },
            { $pull: { friends: { friendId: id, status: FriendStatus.FRIEND } } });
        })
        .then(async (doc: Account) => {
          console.log(doc);
          if (!doc) throw Error(NOT_FOUND.toString());
          // TODO notify update with socketio to friendId.

          return this.getFriendsOfUser(id);
        })
        .then((updatedList: Response<FriendsList>) => {
          resolve(updatedList);
        })
        .catch((getError: ErrorMsg) => {
          reject(getError);
        });
    });
  }
}