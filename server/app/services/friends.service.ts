import { injectable } from 'inversify';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from 'http-status-codes';
import { ObjectId } from 'mongodb';
import accountModel, { Account, FriendsList, FriendStatus } from '../../models/account';
import { DatabaseService, ErrorMsg, Response } from './database.service';

@injectable()
export class FriendsService {

  async getFriendsOfUser(id: string): Promise<Response<FriendsList>> {
    return new Promise<Response<FriendsList>>((resolve, reject) => {
      accountModel.findOne({ _id: id })
        .populate('friends.friendId', 'username')
        .exec((err: Error, doc) => {
          if (err) {
            reject(DatabaseService.rejectMessage(INTERNAL_SERVER_ERROR));
          } else {
            if (doc) {
              const response: FriendsList = {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                friends: doc.friends.map((friend: any) => {
                  return {
                    friendId: friend.friendId ? friend.friendId._id : null,
                    username: friend.friendId ? friend.friendId.username : null,
                    status: friend.status,
                    received: friend.received,
                  };
                })
              };
              resolve({ statusCode: OK, documents: response });
            }
          }
        });
    });
  }

  async requestFriendship(id: string, email: string): Promise<Response<FriendsList>> {
    return new Promise<Response<FriendsList>>((resolve, reject) => {
      // Add friend request to others account
      accountModel.findOneAndUpdate(
        { '_id': { $ne: new ObjectId(id) }, email, 'friends.friendId': { $ne: id } },
        { $push: { friends: { friendId: id, status: FriendStatus.PENDING, received: true } } },
        { useFindAndModify: false }
      ).exec((err: Error, doc: Account) => {
        if (err) {
          reject(DatabaseService.rejectMessage(INTERNAL_SERVER_ERROR));
        } else {
          if (!doc) {
            reject(DatabaseService.rejectMessage(BAD_REQUEST, 'Can\'t send request to that user'));
          } else {
            const friendsId: string = doc._id.toHexString();
            // notify other user with socketio

            // Add friend request to this account
            accountModel.findOneAndUpdate(
              { '_id': new ObjectId(id), 'friends.friendId': { $ne: friendsId } },
              { $push: { friends: { friendId: friendsId, status: FriendStatus.PENDING, received: false } } },
              { useFindAndModify: false }
            ).exec((error: Error, account: Account) => {
              if (error) {
                reject(DatabaseService.rejectMessage(INTERNAL_SERVER_ERROR));
              } else {
                this.getFriendsOfUser(id).then((updatedFriendList: Response<FriendsList>) => {
                  resolve(updatedFriendList);
                }).catch((getError: ErrorMsg) => {
                  reject(getError);
                });
              }
            });
          }
        }
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ).exec((err: Error, doc: any) => {
        if (err) {
          reject(DatabaseService.rejectMessage(INTERNAL_SERVER_ERROR, 'Something went wrong.'));
        }
        else if (doc.nModified === 0) {
          reject(DatabaseService.rejectMessage(BAD_REQUEST, 'Wrong way'));
        } else {
          // update friend for friends account
          accountModel.updateOne(
            {
              '_id': new ObjectId(friendId),
              'friends.friendId': myId,
              'friends.status': FriendStatus.PENDING,
              'friends.received': false
            },
            { $set: { 'friends.$.status': FriendStatus.FRIEND } }
          ).exec((error: Error, document: Account) => {
            if (err) {
              reject(DatabaseService.rejectMessage(INTERNAL_SERVER_ERROR, 'Something went wrong.'));
            }
            else {
              // notify update with socketio to friendId.

              this.getFriendsOfUser(myId).then((updatedFriendList: Response<FriendsList>) => {
                resolve(updatedFriendList);
              }).catch((getError: ErrorMsg) => {
                reject(getError);
              });
            }
          });
        }
      });
    });
  }

  async refuseFriendship(myId: string, friendId: string): Promise<Response<FriendsList>> {
    return new Promise<Response<FriendsList>>((resolve, reject) => {
      // delete friend request for this account
      accountModel.updateOne(
        { _id: new ObjectId(myId) },
        { $pull: { friends: { friendId, status: FriendStatus.PENDING, received: true } } }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ).exec((err: Error, doc: any) => {
        if (err) {
          reject(DatabaseService.rejectMessage(INTERNAL_SERVER_ERROR, 'Something went wrong.'));
        }
        else if (doc.nModified === 0) {
          reject(DatabaseService.rejectMessage(BAD_REQUEST, 'Wrong way'));
        } else {
          // update friend for friends account
          accountModel.updateOne(
            { _id: new ObjectId(friendId) },
            { $pull: { friends: { friendId: myId, status: FriendStatus.PENDING, received: false } } }
          ).exec((error: Error, document: Account) => {
            if (err) {
              reject(DatabaseService.rejectMessage(INTERNAL_SERVER_ERROR, 'Something went wrong.'));
            }
            else {
              // notify update with socketio to friendId.

              this.getFriendsOfUser(myId).then((updatedFriendList: Response<FriendsList>) => {
                resolve(updatedFriendList);
              }).catch((getError: ErrorMsg) => {
                reject(getError);
              });
            }
          });
        }
      });
    });
  }

  async unfriend(id: string, toUnfriendId: string): Promise<Response<FriendsList>> {
    return new Promise<Response<FriendsList>>((resolve, reject) => {
      accountModel
        .updateOne({ _id: new ObjectId(id) }, { $pull: { friends: { friendId: toUnfriendId, status: FriendStatus.FRIEND } } })
        .exec((err: Error, doc: Account) => {
          if (err) {
            reject(DatabaseService.rejectMessage(INTERNAL_SERVER_ERROR, 'Something went wrong.'));
          } else if (!doc) {
            reject(DatabaseService.rejectMessage(NOT_FOUND));
          } else {
            console.log(doc);
            accountModel
              .updateOne({ _id: new ObjectId(toUnfriendId) }, { $pull: { friends: { friendId: id, status: FriendStatus.FRIEND } } })
              .exec((error: Error, document: Account) => {
                if (error) {
                  reject(DatabaseService.rejectMessage(INTERNAL_SERVER_ERROR, 'Something went wrong.'));
                } else if (!document) {
                  reject(DatabaseService.rejectMessage(NOT_FOUND));
                }
                else {
                  // notify update with socketio to friendId.


                  this.getFriendsOfUser(id).then((updatedFriendList: Response<FriendsList>) => {
                    resolve(updatedFriendList);
                  }).catch((getError: ErrorMsg) => {
                    reject(getError);
                  });
                }
              });
          }
        });
    });
  }
}