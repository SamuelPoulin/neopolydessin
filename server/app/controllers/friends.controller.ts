import * as express from 'express';
import { inject, injectable } from 'inversify';
import { OK } from 'http-status-codes';
import { body } from 'express-validator';
import Types from '../types';
import { jwtVerify } from '../middlewares/jwt-verify';
import { FriendsService } from '../services/friends.service';
import { Friends } from '../../models/friends';
import { ErrorMsg } from '../services/database.service';
import { FriendRequest } from '../../../common/communication/friend-request';

@injectable()
export class FriendsController {
  router: express.Router;

  constructor(@inject(Types.FriendsService) private friendsService: FriendsService) {
    this.configureRouter();
  }

  private configureRouter(): void {
    this.router = express.Router();

    this.router.get('/', jwtVerify, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      this.friendsService.getFriendsOfUser(req.params._id).then((result: Friends) => {
        res.status(OK).json(result);
      }).catch((error: ErrorMsg) => {
        res.status(error.statusCode).json(error.message);
      });
    });

    this.router.post('/', [
      body('email').isEmail(),
    ], jwtVerify, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const friendRequest: FriendRequest = req.body;
      this.friendsService.requestFriendship(req.params._id, friendRequest.email).then((result: Friends) => {
        res.status(OK).json(result);
      }).catch((error: ErrorMsg) => {
        res.status(error.statusCode).json(error.message);
      });
    });
  }

}