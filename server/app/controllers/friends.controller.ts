import * as express from 'express';
import { inject, injectable } from 'inversify';
import { body } from 'express-validator';
import Types from '../types';
import { jwtVerify } from '../middlewares/jwt-verify';
import { FriendsService } from '../services/friends.service';
import { ErrorMsg, Response } from '../services/database.service';
import { Decision, FriendRequest } from '../../../common/communication/friend-request';
import { validationCheck } from '../middlewares/validation-check';
import { LoggedIn } from '../middlewares/logged-in';
import { FriendsList } from '../../models/account';

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
        this.friendsService.getFriendsOfUser(req.params._id).then((result: Response<FriendsList>) => {
          res.status(result.statusCode).json(result.documents);
        }).catch((error: ErrorMsg) => {
          res.status(error.statusCode).json(error.message);
        });
      });

    this.router.post('/',
      [body('username').isString(),],
      validationCheck,
      jwtVerify,
      this.loggedIn.checkLoggedIn.bind(this.loggedIn),
      async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const friendRequest: FriendRequest = req.body;
        this.friendsService.requestFriendship(req.params._id, friendRequest.username).then((result: Response<FriendsList>) => {
          res.status(result.statusCode).json(result.documents);
        }).catch((error: ErrorMsg) => {
          res.status(error.statusCode).json(error.message);
        });
      });

    this.router.post('/decision',
      [
        body('idOfFriend').notEmpty(),
        body('decision').isIn([Decision.ACCEPT, Decision.REFUSE]),
      ],
      validationCheck,
      jwtVerify,
      this.loggedIn.checkLoggedIn.bind(this.loggedIn),
      async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (req.body.decision === Decision.ACCEPT) {
          this.friendsService.acceptFriendship(req.params._id, req.body.idOfFriend).then((result: Response<FriendsList>) => {
            res.status(result.statusCode).json(result.documents);
          }).catch((error: ErrorMsg) => {
            res.status(error.statusCode).json(error.message);
          });
        } else {
          this.friendsService.refuseFriendship(req.params._id, req.body.idOfFriend).then((result: Response<FriendsList>) => {
            res.status(result.statusCode).json(result.documents);
          }).catch((error: ErrorMsg) => {
            res.status(error.statusCode).json(error.message);
          });
        }
      });

    this.router.delete('/:id',
      jwtVerify,
      this.loggedIn.checkLoggedIn.bind(this.loggedIn),
      async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.friendsService.unfriend(req.params._id, req.params.id).then((result: Response<FriendsList>) => {
          res.status(result.statusCode).json(result.documents);
        }).catch((error: ErrorMsg) => {
          res.status(error.statusCode).json(error.message);
        });
      });
  }

}