import { inject, injectable } from 'inversify';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from 'http-status-codes';
import { ObjectId } from 'mongodb';
import accountModel, { Account, UpdateOneQueryResult } from '../../models/schemas/account';
import Types from '../types';
import { SocketIo } from '../socketio';
import { NotificationType, SocketFriendActions } from '../../../common/socketendpoints/socket-friend-actions';
import messagesHistoryModel, { MessageHistory, Messages } from '../../models/schemas/messages-history';
import { Friend, FriendsList } from '../../../common/communication/friends';
import { DatabaseService, ErrorMsg, Response } from './database.service';

@injectable()
export class FriendsService {

  constructor(
    @inject(Types.Socketio) private socketIo: SocketIo,
  ) { }

  async getMessageHistory(id: string, otherId: string, page: number, limit: number): Promise<Response<MessageHistory>> {
    return new Promise<Response<MessageHistory>>((resolve, reject) => {
      messagesHistoryModel
        .findHistory(id, otherId, page, limit)
        .then((messages: Messages | null) => {
          if (!messages) throw new Error(NOT_FOUND.toString());
          resolve({ statusCode: OK, documents: { messages: messages.messages.reverse() } });
        })
        .catch((err) => {
          reject(DatabaseService.rejectErrorMessage(err));
        });
    });
  }

  async getFriendsOfUser(id: string): Promise<Response<FriendsList>> {
    return new Promise<Response<FriendsList>>((resolve, reject) => {
      accountModel.findById(id)
        .then(async (doc: Account) => {
          if (!doc) throw new Error(NOT_FOUND.toString());
          return accountModel.populate(doc, { path: 'friends.friendId', select: ['username', 'avatar'] });
        })
        .then((result) => {
          const friendList: Friend[] = result.friends as unknown as Friend[];
          resolve({ statusCode: OK, documents: { friends: this.socketIo.checkOnlineStatus(friendList) } });
        })
        .catch((err: Error) => {
          reject(DatabaseService.rejectErrorMessage(err));
        });
    });
  }

  async requestFriendship(id: string, username: string): Promise<Response<FriendsList>> {
    return new Promise<Response<FriendsList>>((resolve, reject) => {
      let friendId: string;
      accountModel.addFriendRequestToAccountWithUsername(id, username)
        .then(async (doc: Account) => {
          if (!doc) throw Error(BAD_REQUEST.toString());
          friendId = doc._id.toHexString();
          return this.getFriendsOfUser(friendId);
        })
        .then((friendList: Response<FriendsList>) => {
          this.socketIo.sendFriendListTo(SocketFriendActions.UPDATE, friendId, friendList);
          SocketIo.FRIEND_LIST_NOTIFICATION.notify({ accountId: id, friendId, type: NotificationType.requestReceived });
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
          const history = {
            accountId: myId,
            otherAccountId: friendId,
            messages: [],
          };
          const model = new messagesHistoryModel(history);
          return model.save();
        })
        .then(async (result) => {
          if (!result) throw Error(INTERNAL_SERVER_ERROR.toString());
          return this.getFriendsOfUser(friendId);
        })
        .then(async (friendList: Response<FriendsList>) => {
          this.socketIo.sendFriendListTo(SocketFriendActions.UPDATE, friendId, friendList);
          SocketIo.FRIEND_LIST_NOTIFICATION.notify({ accountId: myId, friendId, type: NotificationType.requestAccepted });
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
          this.socketIo.sendFriendListTo(SocketFriendActions.UPDATE, friendId, friendList);
          SocketIo.FRIEND_LIST_NOTIFICATION.notify({ accountId: myId, friendId, type: NotificationType.requestRefused });
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
          return messagesHistoryModel.removeHistory(myId, toUnfriendId);
        })
        .then(async (doc) => {
          return this.getFriendsOfUser(toUnfriendId);
        })
        .then(async (friendList: Response<FriendsList>) => {
          this.socketIo.sendFriendListTo(SocketFriendActions.UPDATE, toUnfriendId, friendList);
          SocketIo.FRIEND_LIST_NOTIFICATION.notify({ accountId: myId, friendId: toUnfriendId, type: NotificationType.unfriended });
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