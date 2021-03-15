import * as express from 'express';
import { inject, injectable } from 'inversify';
import { jwtVerify } from '../middlewares/jwt-verify';
import { LoggedIn } from '../middlewares/logged-in';
import Types from '../types';

@injectable()
export class AvatarController {
  router: express.Router;

  constructor(
    @inject(Types.LoggedIn) private loggedIn: LoggedIn,
  ) {
    this.configureRouter();
  }

  private configureRouter(): void {
    this.router = express.Router();

    this.router.post('/upload',
      jwtVerify,
      this.loggedIn.checkLoggedIn.bind(this.loggedIn),
      async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        console.log(req.body);
      });

  }

}