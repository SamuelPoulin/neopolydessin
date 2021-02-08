import { inject, injectable } from 'inversify';
import Types from '../types';

import * as express from 'express';
import { DatabaseService } from '../services/database.service';

@injectable()
export class DatabaseController {
  router: express.Router;

  constructor(@inject(Types.DatabaseService) private databaseService: DatabaseService) {
    this.configureRouter();
  }

  private configureRouter(): void {
    this.router = express.Router();

    this.router.get('/account/:username', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      this.databaseService.getAccountByUsername(req.params.username).then((results) => {
        DatabaseService.handleResults(res, results);
      });
    });

    this.router.post('/account', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      this.databaseService.createAccount(req.body).then((results) => {
        DatabaseService.handleResults(res, results);
      }).catch((error) => {
        res.json(error);
      });
    });

    this.router.delete('/account/:username', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      this.databaseService.deleteAccount(req.params.username).then((results) => {
        DatabaseService.handleResults(res, results);
      });
    });

    this.router.post('/account/:username', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      this.databaseService.updateAccount(req.params.username, req.body).then((results) => {
        DatabaseService.handleResults(res, results);
      }).catch((error) => {
        res.json(error);
      });
    });
  }
}
