import express from 'express';
import httpStatus from 'http-status-codes';
import { inject, injectable } from 'inversify';
import { DatabaseService, ErrorMsg } from '../services/database.service';
import Types from '../types';

@injectable()
export class LoggedIn {

  constructor(
    @inject(Types.DatabaseService) private databaseService: DatabaseService
  ) { }


  async checkLoggedIn(req: express.Request, res: express.Response, next: express.NextFunction) {
    const accountId = req.params._id;
    if (accountId) {
      this.databaseService.checkIfLoggedIn(accountId).then(() => {
        next();
      }).catch((error: ErrorMsg) => {
        res.status(error.statusCode).json(error.message);
      });
    } else {
      res.status(httpStatus.UNAUTHORIZED).json('Access denied');
    }
  };
}