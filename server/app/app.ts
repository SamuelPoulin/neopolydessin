import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { inject, injectable } from 'inversify';
import logger from 'morgan';
import { ContentType } from '../models/schemas/avatar';
import { APIController } from './controllers/api.controller';
import Types from './types';

@injectable()
export class Application {
  app: express.Application;

  private readonly INTERNAL_ERROR: number = 500;

  constructor(@inject(Types.APIController) private apiController: APIController) {
    this.app = express();

    this.config();

    this.bindRoutes();
  }

  private config(): void {
    // Middlewares configuration
    this.app.use(logger('dev'));
    this.app.use(bodyParser.json({ limit: '25mb' }));
    this.app.use(bodyParser.urlencoded({ extended: true, limit: '25mb' }));
    this.app.use(bodyParser.raw({
      type: [ContentType.png, ContentType.jpeg],
      limit: '3mb',
    }));
    this.app.use(cookieParser());
    this.app.use(cors({ optionsSuccessStatus: 200 }));
  }

  private bindRoutes(): void {
    this.app.use('/api', this.apiController.router);
    this.errorHandling();
  }

  private errorHandling(): void {
    // When previous handlers have not served a request: path wasn't found
    this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
      const err: Error = new Error('Not Found');
      next(err);
    });

    // development error handler
    // will print stacktrace
    if (this.app.get('env') === 'development') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.status(err.status || this.INTERNAL_ERROR);
        res.send({
          message: err.message,
          error: err,
        });
      });
    }

    // production error handler
    // no stacktraces leaked to user (in production env only)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      res.status(err.status || this.INTERNAL_ERROR);
      res.send({
        message: err.message,
        error: {},
      });
    });
  }
}
