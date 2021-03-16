import * as express from 'express';
import { header } from 'express-validator';
import { inject, injectable } from 'inversify';
import { ContentType } from '../../models/schemas/avatar';
import { jwtVerify } from '../middlewares/jwt-verify';
import { LoggedIn } from '../middlewares/logged-in';
import { validationCheck } from '../middlewares/validation-check';
import { AvatarService } from '../services/avatar.service';
import { ErrorMsg } from '../services/database.service';
import Types from '../types';

@injectable()
export class AvatarController {
  router: express.Router;

  constructor(
    @inject(Types.AvatarService) private avatarService: AvatarService,
    @inject(Types.LoggedIn) private loggedIn: LoggedIn,
  ) {
    this.configureRouter();
  }

  private configureRouter(): void {
    this.router = express.Router();

    this.router.post('/upload',
      [
        header('Content-Type').isIn([ContentType.png, ContentType.jpeg])
      ],
      validationCheck,
      jwtVerify,
      this.loggedIn.checkLoggedIn.bind(this.loggedIn),
      async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.avatarService.upload(req.params._id, req.body, req.header('content-type') as ContentType)
          .then((response) => {
            res.status(response.statusCode).json(response.documents);
          })
          .catch((error: ErrorMsg) => {
            res.status(error.statusCode).json(error.message);
          });
      });
  }

}