import { inject, injectable } from 'inversify';
import { BAD_REQUEST, NOT_FOUND, OK } from 'http-status-codes';
import { ObjectId } from 'mongodb';
import accountModel, { Account, FriendsList, UpdateOneQueryResult } from '../../models/account';
import Types from '../types';
import { SocketIo } from '../socketio';
import { SocketFriendActions } from '../../../common/socketendpoints/socket-friend-actions';
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
      accountModel.addFriendRequestToAccountWithEmail(id, email)
        .then(async (doc: Account) => {
          if (!doc) throw Error(BAD_REQUEST.toString());
          // console.log(doc);
          friendId = doc._id.toHexString();
          return this.getFriendsOfUser(friendId);
        })
        .then((friendList: Response<FriendsList>) => {
          this.socketIo.sendFriendListTo(SocketFriendActions.FRIEND_REQUEST_RECEIVED, friendId, friendList);
          return accountModel.addFriendrequestToSenderWithId(id, friendId);
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
      accountModel
        .acceptFriendship(myId, friendId, true)
        .then((doc: UpdateOneQueryResult) => {
          if (doc.nModified === 0) throw Error(BAD_REQUEST.toString());
          return accountModel.acceptFriendship(friendId, myId, false);
        })
        .then(async () => {
          return this.getFriendsOfUser(friendId);
        })
        .then(async (friendList: Response<FriendsList>) => {
          this.socketIo.sendFriendListTo(SocketFriendActions.FRIEND_REQUEST_ACCEPTED, friendId, friendList);
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
      accountModel
        .refuseFriendship(myId, friendId, true)
        .then((doc: UpdateOneQueryResult) => {
          if (doc.nModified === 0) throw Error(BAD_REQUEST.toString());
          return accountModel.refuseFriendship(friendId, myId, false);
        })
        .then(async (doc: UpdateOneQueryResult) => {
          return this.getFriendsOfUser(friendId);
        })
        .then(async (friendList: Response<FriendsList>) => {
          this.socketIo.sendFriendListTo(SocketFriendActions.FRIEND_REQUEST_REFUSED, friendId, friendList);
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

  async unfriend(myId: string, toUnfriendId: string): Promise<Response<FriendsList>> {
    const id: ObjectId = new ObjectId(myId);
    const otherId: ObjectId = new ObjectId(toUnfriendId);
    return new Promise<Response<FriendsList>>((resolve, reject) => {
      accountModel
        .unfriend(id, otherId)
        .then((doc: UpdateOneQueryResult) => {
          if (doc.nModified === 0) throw Error(NOT_FOUND.toString());
          return accountModel.unfriend(otherId, id);
        })
        .then(async (doc) => {
          if (doc.nModified === 0) throw Error(NOT_FOUND.toString());
          return this.getFriendsOfUser(toUnfriendId);
        })
        .then(async (friendList: Response<FriendsList>) => {
          this.socketIo.sendFriendListTo(SocketFriendActions.UPDATE, toUnfriendId, friendList);
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
}