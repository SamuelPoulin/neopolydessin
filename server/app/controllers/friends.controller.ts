import * as express from 'express';
import { inject, injectable } from 'inversify';
import { body } from 'express-validator';
import Types from '../types';
import { jwtVerify } from '../middlewares/jwt-verify';
import { FriendsService } from '../services/friends.service';
import { Friends } from '../../models/friends';
import { ErrorMsg, Response } from '../services/database.service';
import { FriendRequest } from '../../../common/communication/friend-request';
// import { LoggedIn } from '../middlewares/logged-in';
import { validationCheck } from '../middlewares/validation-check';
import { LoggedIn } from '../middlewares/logged-in';

@injectable()
export class FriendsController {
  router: express.Router;

  constructor(
    @inject(Types.FriendsService) private friendsService: FriendsService,
    @inject(Types.LoggedIn) private loggedIn: LoggedIn
  ) {
    this.configureRouter();
  }

  private configureRouter(): void {
    this.router = express.Router();

    this.router.get('/',
      jwtVerify,
      this.loggedIn.checkLoggedIn.bind(this.loggedIn),
      async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.friendsService.getFriendsOfUser(req.params._id).then((result: Response<Friends>) => {
          res.status(result.statusCode).json(result.documents);
        }).catch((error: ErrorMsg) => {
          res.status(error.statusCode).json(error.message);
        });
      });

    this.router.post('/',
      [body('email').isEmail(),],
      validationCheck,
      jwtVerify,
      this.loggedIn.checkLoggedIn.bind(this.loggedIn),
      async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const friendRequest: FriendRequest = req.body;
        this.friendsService.requestFriendship(req.params._id, friendRequest.email).then((result: Response<Friends>) => {
          res.status(result.statusCode).json(result.documents);
        }).catch((error: ErrorMsg) => {
          res.status(error.statusCode).json(error.message);
        });
      });
  }

}