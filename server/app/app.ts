import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as express from 'express';
import * as fs from 'fs';
import { inject, injectable } from 'inversify';
import * as logger from 'morgan';
import { APIController } from './controllers/api.controller';
import Types from './types';

@injectable()
export class Application {
  private readonly internalError: number = 500;
  app: express.Application;

  constructor(@inject(Types.APIController) private apiController: APIController) {
    this.app = express();

    this.config();

    this.bindRoutes();
  }

  private config(): void {
    // Middlewares configuration
    fs.readFile('emailAPI.env', (err, data) => {
        process.env.API_KEY = data.toString().split('@')[0];
    });
    this.app.use(logger('dev'));
    this.app.use(bodyParser.json({limit: '25mb'}));
    this.app.use(bodyParser.urlencoded({ extended: true, limit: '25mb' }));
    this.app.use(cookieParser());
    this.app.use(cors());
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
      // tslint:disable-next-line:no-any
      this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.status(err.status || this.internalError);
        res.send({
          message: err.message,
          error: err,
        });
      });
    }

    // production error handler
    // no stacktraces leaked to user (in production env only)
    // tslint:disable-next-line:no-any
    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      res.status(err.status || this.internalError);
      res.send({
        message: err.message,
        error: {},
      });
    });
  }
}
