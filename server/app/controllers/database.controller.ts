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

    this.router.get('/drawings', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      this.databaseService.getAllDrawings().then((results) => {
        DatabaseService.handleResults(res, results);
      });
    });

    this.router.get('/drawing', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const name = req.query.name == null ? '' : req.query.name;
      const tag = req.query.tag;

      this.databaseService.searchDrawings(name, tag).then((results) => {
        DatabaseService.handleResults(res, results);
      });
    });

    this.router.get('/drawings/:id', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      this.databaseService.getDrawingById(req.params.id).then((results) => {
        DatabaseService.handleResults(res, results);
      });
    });

    this.router.post('/drawings', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      this.databaseService.addDrawing(req.body).then((results) => {
        DatabaseService.handleResults(res, results);
      });
    });

    this.router.delete('/drawings/:id', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      this.databaseService.deleteDrawing(req.params.id).then((results) => {
        DatabaseService.handleResults(res, results);
      });
    });

    this.router.post('/drawings/:id', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      this.databaseService.updateDrawing(req.params.id, req.body).then((results) => {
        DatabaseService.handleResults(res, results);
      });
    });
  }
}
