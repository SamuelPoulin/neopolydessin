import * as express from 'express';
import { body } from 'express-validator';
import * as httpStatus from 'http-status-codes';
import { inject, injectable } from 'inversify';
import { jwtVerify } from '../middlewares/jwt-verify';
import { LoggedIn } from '../middlewares/logged-in';
import { validationCheck } from '../middlewares/validation-check';
import { DatabaseService, ErrorMsg } from '../services/database.service';
import Types from '../types';

@injectable()
export class DatabaseController {
  router: express.Router;

  constructor(
    @inject(Types.DatabaseService) private databaseService: DatabaseService,
    @inject(Types.LoggedIn) private loggedIn: LoggedIn,
  ) {
    this.configureRouter();
  }

  private configureRouter(): void {
    this.router = express.Router();

    this.router.post('/auth/register',
      [
        body('email').isEmail(),
        body('password').isLength({ min: 6 }),
        // eslint-disable-next-line @typescript-eslint/typedef
        body('passwordConfirm').custom((value, { req }) => {
          if (value !== req.body.password) {
            throw new Error('Passwords do not match');
          } else {
            return true;
          }
        })
      ],
      validationCheck,
      async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.databaseService.createAccount(req.body).then((result) => {
          res.header('authorization', result.documents.accessToken).status(result.statusCode).json(result.documents);
        }).catch((error: ErrorMsg) => {
          res.status(error.statusCode).json(error.message);
        });
      });

    this.router.post('/auth/login',
      [
        body('username').exists(),
        body('password').exists()
      ],
      validationCheck,
      async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.databaseService.login(req.body).then((result) => {
          res.header('authorization', result.documents.accessToken).status(result.statusCode).json(result.documents);
        }).catch((error: ErrorMsg) => {
          res.status(error.statusCode).json(error.message);
        });
      });

    this.router.post('/auth/refresh',
      [body('refreshToken').exists()],
      validationCheck,
      async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.databaseService.refreshToken(req.body.refreshToken).then((newAccesToken) => {
          res.status(httpStatus.OK).json({ data: { accessToken: newAccesToken } });
        }).catch((error: ErrorMsg) => {
          res.status(error.statusCode).json(error.message);
        });
      });

    this.router.delete('/auth/logout',
      [body('refreshToken').exists()],
      validationCheck,
      async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.databaseService.logout(req.body.refreshToken)
          .then((successfull) => {
            res.status(httpStatus.OK).json({ success: 'User logged out' });
          }).catch((error: ErrorMsg) => {
            res.status(error.statusCode).json(error.message);
          });
      });

    this.router.get('/account',
      jwtVerify,
      this.loggedIn.checkLoggedIn.bind(this.loggedIn),
      async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.databaseService.getAccountById(req.params._id)
          .then((results) => {
            res.status(results.statusCode).json(results.documents);
          }).catch((err: ErrorMsg) => {
            res.status(err.statusCode).json(err.message);
          });
      });

    this.router.delete('/account',
      jwtVerify,
      this.loggedIn.checkLoggedIn.bind(this.loggedIn),
      async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.databaseService.deleteAccount(req.params._id)
          .then((results) => {
            res.status(results.statusCode).json(results.documents);
          }).catch((err: ErrorMsg) => {
            res.status(err.statusCode).json(err.message);
          });
      });

    this.router.post('/account', jwtVerify, [
      body('_id').isEmpty(),
      body('firstName').optional(),
      body('lastName').optional(),
      body('username').optional(),
      body('email').optional(),
      body('password').isEmpty(),
      validationCheck,
      this.loggedIn.checkLoggedIn.bind(this.loggedIn),
    ], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      this.databaseService.updateAccount(req.params._id, req.body)
        .then((results) => {
          res.status(results.statusCode).json(results.documents);
        }).catch((error: ErrorMsg) => {
          res.status(error.statusCode).json(error.message);
        });
    });
  }
}
