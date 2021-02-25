import { inject, injectable } from 'inversify';
import { BAD_REQUEST, NOT_FOUND, OK } from 'http-status-codes';
import { ObjectId } from 'mongodb';
import accountModel, { Account, FriendsList, FriendStatus } from '../../models/account';
import Types from '../types';
import { SocketIo } from '../socketio';
import { DatabaseService, ErrorMsg, Response } from './database.service';

@injectable()
export class FriendsService {

  constructor(
    @inject(Types.Socketio) private socketIo: SocketIo,
  ) { }

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
      let friendId: string;
      // Add friend request to others account
      accountModel.updateOne(
        { '_id': { $ne: new ObjectId(id) }, email, 'friends.friendId': { $ne: id } },
        { $push: { friends: { friendId: id, status: FriendStatus.PENDING, received: true } } })
        .then(async (doc: Account) => {
          if (!doc) throw Error(BAD_REQUEST.toString());
          friendId = doc._id.toHexString();
          return this.getFriendsOfUser(friendId);
        })
        .then((friendList: Response<FriendsList>) => {
          this.socketIo.sendFriendListTo(friendId, friendList);

          // Add friend request to this account
          return accountModel.updateOne(
            { '_id': new ObjectId(id), 'friends.friendId': { $ne: friendId } },
            { $push: { friends: { friendId, status: FriendStatus.PENDING, received: false } } }
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
          // update friend for others account
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
          return this.getFriendsOfUser(friendId);
        })
        .then(async (friendList: Response<FriendsList>) => {
          this.socketIo.sendFriendListTo(friendId, friendList);
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
          return this.getFriendsOfUser(friendId);
        })
        .then(async (friendList: Response<FriendsList>) => {
          this.socketIo.sendFriendListTo(friendId, friendList);
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

          return this.getFriendsOfUser(toUnfriendId);
        })
        .then(async (friendList: Response<FriendsList>) => {
          this.socketIo.sendFriendListTo(toUnfriendId, friendList);
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