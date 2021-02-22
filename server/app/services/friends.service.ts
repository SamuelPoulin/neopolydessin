import { inject, injectable } from 'inversify';
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from 'http-status-codes';
import Types from '../types';
import friendsModel, { Friends } from '../../models/friends';
import { DatabaseService } from './database.service';

@injectable()
export class FriendsService {

  constructor(
    @inject(Types.DatabaseService) private databaseService: DatabaseService,
  ) { }

  async getFriendsOfUser(id: string): Promise<Friends> {
    return new Promise<Friends>((resolve, reject) => {
      friendsModel.findOne({ accountId: id }, (err: Error, doc: Friends) => {
        if (err) {
          reject(DatabaseService.rejectMessage(INTERNAL_SERVER_ERROR, 'Something went wrong'));
        } else {
          if (!doc) {
            reject(DatabaseService.rejectMessage(NOT_FOUND, 'Account doesn\'t exist'));
          } else {
            resolve(doc);
          }
        }
      });
    });
  }

  async requestFriendship(id: string, email: string): Promise<Friends> {
    return new Promise<Friends>((resolve, reject) => {

    })
  }

}