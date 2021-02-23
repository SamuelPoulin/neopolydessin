import { inject, injectable } from 'inversify';
import { INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from 'http-status-codes';
import Types from '../types';
import friendsModel, { Friends, FriendStatus } from '../../models/friends';
import { DatabaseService, Response } from './database.service';

@injectable()
export class FriendsService {

  constructor(
    @inject(Types.DatabaseService) private databaseService: DatabaseService,
  ) { }

  async getFriendsOfUser(id: string): Promise<Response<Friends>> {
    return new Promise<Response<Friends>>((resolve, reject) => {
      friendsModel.findOne({ accountId: id }, (err: Error, doc: Friends) => {
        if (err) {
          reject(DatabaseService.rejectMessage(INTERNAL_SERVER_ERROR, 'Something went wrong'));
        } else {
          resolve({ statusCode: OK, documents: doc });
        }
      });
    });
  }

  async requestFriendship(id: string, email: string): Promise<Response<Friends>> {
    return new Promise<Response<Friends>>((resolve, reject) => {
      this.databaseService.getAccountById(id).then((sender) => {
        this.databaseService.getAccountByEmail(email).then((receiver) => {
          if (!receiver.documents) {
            reject(DatabaseService.rejectMessage(NOT_FOUND, 'Account doesn\'t exist'));
          } else {
            // add friend request to receiver
            friendsModel.updateOne({
              'accountId': receiver.documents._id,
              'friends.accountId': { $ne: id }
            }, {
              $push: {
                friends:
                {
                  accountId: id,
                  status: FriendStatus.PENDING,
                  username: sender.documents.username
                }
              }
            }).then((value) => {
              // emit notification with socket
            });
            // add friend request to sender
            friendsModel.updateOne({
              'accountId': id,
              'friends.accountId': { $ne: receiver.documents._id }
            }, {
              $push: {
                friends:
                {
                  accountId: receiver.documents._id,
                  status: FriendStatus.PENDING,
                  username: receiver.documents.username
                }
              }
            }).then(() => {
              friendsModel.findOne({ accountId: id }, (err: Error, doc: Friends) => {
                if (err) {
                  reject(DatabaseService.rejectMessage(INTERNAL_SERVER_ERROR, 'Something went wrong'));
                } else {
                  resolve({ statusCode: OK, documents: doc });
                }
              });
            });
          }
        }).catch(() => {
          reject(DatabaseService.rejectMessage(INTERNAL_SERVER_ERROR, 'Something went wrong'));
        });
      }).catch(() => {
        reject(DatabaseService.rejectMessage(INTERNAL_SERVER_ERROR, 'Something went wrong'));
      });
    });
  }

  async acceptFriendship(myId: string, friendId: string): Promise<Response<Friends>> {
    return new Promise<Response<Friends>>((resolve, reject) => {
      // add friend request to sender
      friendsModel.updateOne({
        'accountId': friendId,
        'friends.accountId': myId
      }, {
        status: FriendStatus.FRIEND,
      }).then(() => {
        // emit notification with socket
      });
      // add friend request to receiver
      friendsModel.updateOne({
        'accountId': myId,
        'friends.accountId': friendId
      }, {
        status: FriendStatus.FRIEND
      }).then((value) => {
        friendsModel.findOne({ accountId: myId }, (err: Error, doc: Friends) => {
          if (err) {
            reject(DatabaseService.rejectMessage(INTERNAL_SERVER_ERROR, 'Something went wrong'));
          } else {
            resolve({ statusCode: OK, documents: doc });
          }
        });
      });
    });
  }

  async refuseFriendship(myId: string, friendId: string): Promise<Response<Friends>> {
    return new Promise<Response<Friends>>((resolve, reject) => {
      // delete friend request
    });
  }
}