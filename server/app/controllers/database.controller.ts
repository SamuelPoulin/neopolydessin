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

  private badRequestIfValidationFailed(req: express.Request, res: express.Response, func: () => void): void {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(httpStatus.BAD_REQUEST).json({ errors: errors.array() });
    } else {
      func();
    }
  }

  private unauthorizedIfLoggedOut(req: express.Request, res: express.Response, func: () => void): void {
    const accountId = req.params._id;
    if (accountId) {
      this.databaseService.checkIfLoggedIn(accountId).then((isLoggedIn) => {
        if (isLoggedIn) {
          func();
        }
      }).catch((error: ErrorMsg) => {
        res.status(error.statusCode).json(error.message);
      });
    } else {
      res.status(httpStatus.UNAUTHORIZED).json('Access denied');
    }
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
      this.badRequestIfValidationFailed(req, res, () => {
        this.databaseService.createAccount(req.body).then((results) => {
          res.status(results.statusCode).json(results.documents);
        }).catch((error: ErrorMsg) => {
          res.status(error.statusCode).json(error.message);
        });
      });
    });

    this.router.post('/auth/login', [
      body('username').exists(),
      body('password').exists()
    ], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      this.badRequestIfValidationFailed(req, res, () => {
        this.databaseService.login(req.body).then((tokens: string[]) => {
          res.header('authorization', tokens[0]).json({ data: { accessToken: tokens[0], refreshToken: tokens[1] } });
        }).catch((error: ErrorMsg) => {
          res.status(error.statusCode).json(error.message);
        });
      });
    });

    this.router.post('/auth/refresh', [
      body('refreshToken').exists()
    ], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      this.badRequestIfValidationFailed(req, res, () => {
        this.databaseService.refreshToken(req.body.refreshToken).then((newAccesToken) => {
          res.status(httpStatus.OK).json({ data: { accessToken: newAccesToken } });
        }).catch((error: ErrorMsg) => {
          res.status(error.statusCode).json(error.message);
        });
      });
    });

    this.router.delete('/auth/logout', [
      body('refreshToken').exists()
    ], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      this.badRequestIfValidationFailed(req, res, () => {
        this.databaseService.logout(req.body.refreshToken).then((successfull) => {
          if (successfull) {
            res.status(httpStatus.OK).json({ success: 'User logged out' });
          }
        }).catch((error: ErrorMsg) => {
          res.status(error.statusCode).json(error.message);
        });
      });
    });

    this.router.get('/account', jwtVerify, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      this.unauthorizedIfLoggedOut(req, res, () => {
        this.databaseService.getAccountById(req.params._id).then((results) => {
          DatabaseService.handleResults(res, results);
        });
      });
    });

    this.router.delete('/account', jwtVerify, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      this.unauthorizedIfLoggedOut(req, res, () => {
        this.databaseService.deleteAccount(req.params._id).then((results) => {
          DatabaseService.handleResults(res, results);
        });
      });
    });

    this.router.post('/account', jwtVerify, [
      body('_id').isEmpty(),
      body('name').optional(),
      body('username').optional(),
      body('email').optional(),
      body('password').isEmpty(),
    ], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      this.badRequestIfValidationFailed(req, res, () => {
        this.unauthorizedIfLoggedOut(req, res, () => {
          this.databaseService.updateAccount(req.params._id, req.body).then((results) => {
            DatabaseService.handleResults(res, results);
          }).catch((error: ErrorMsg) => {
            res.status(error.statusCode).json(error.message);
          });
        });
      });
    });
  }
}
