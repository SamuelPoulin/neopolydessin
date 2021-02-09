import * as express from 'express';
import { body, validationResult } from 'express-validator';
import * as httpStatus from 'http-status-codes';
import { inject, injectable } from 'inversify';
import { jwtVerify } from '../middlewares/jwt-verify';
import { DatabaseService, ErrorMsg } from '../services/database.service';
import Types from '../types';

@injectable()
export class DatabaseController {
  router: express.Router;

  constructor(@inject(Types.DatabaseService) private databaseService: DatabaseService) {
    this.configureRouter();
  }

  private configureRouter(): void {
    this.router = express.Router();

    this.router.post('/auth/register', [
      body('email').isEmail(),
      body('password').isLength({ min: 6 }),
      body('passwordConfirm').custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match');
        } else {
          return true;
        }
      })
    ], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(httpStatus.BAD_REQUEST).json({ errors: errors.array() });
      } else {
        this.databaseService.createAccount(req.body).then((results) => {
          DatabaseService.handleResults(res, results);
        }).catch((error: ErrorMsg) => {
          res.status(error.statusCode).json(error.message);
        });
      }
    });

    this.router.post('/auth/login', [
      body('username').exists(),
      body('password').exists()
    ], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(httpStatus.BAD_REQUEST).json({ errors: errors.array() });
      } else {
        this.databaseService.login(req.body).then((tokens: string[]) => {
          res.header('authorization', tokens[0]).json({ data: { accessToken: tokens[0], refreshToken: tokens[1] } });
        }).catch((error: ErrorMsg) => {
          res.status(error.statusCode).json(error.message);
        });
      }
    });

    this.router.post('/auth/refresh', [
      body('refreshToken').exists()
    ], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(httpStatus.BAD_REQUEST).json({ errors: errors.array() });
      } else {
        this.databaseService.refreshToken(req.body.refreshToken).then((newAccesToken) => {
          res.status(httpStatus.OK).json({ data: { accessToken: newAccesToken } });
        }).catch((error: ErrorMsg) => {
          res.status(error.statusCode).json(error.message);
        });
      }
    });

    this.router.delete('/auth/logout', [
      body('refreshToken').exists()
    ], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(httpStatus.BAD_REQUEST).json({ errors: errors.array() });
      } else {
        this.databaseService.logout(req.body.refreshToken).then((successfull) => {
          if (successfull) {
            res.status(httpStatus.OK).json({ success: 'User logged out' });
          }
        }).catch((error: ErrorMsg) => {
          res.status(error.statusCode).json(error.message);
        });
      }
    });

    this.router.get('/account', jwtVerify, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      this.databaseService.getAccountById(req.params._id).then((results) => {
        DatabaseService.handleResults(res, results);
      });
    });

    this.router.delete('/account', jwtVerify, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      this.databaseService.deleteAccount(req.params._id).then((results) => {
        DatabaseService.handleResults(res, results);
      });
    });

    this.router.post('/account', jwtVerify, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      this.databaseService.updateAccount(req.params._id, req.body).then((results) => {
        DatabaseService.handleResults(res, results);
      }).catch((error: ErrorMsg) => {
        res.status(error.statusCode).json(error.message);
      });
    });
  }
}
