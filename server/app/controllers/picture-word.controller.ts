import { Request, Response, NextFunction, Router } from 'express';
import { body, header } from 'express-validator';
import { inject, injectable } from 'inversify';
import { PictureWordService } from 'app/services/picture-word.service';
import { jwtVerify } from '../middlewares/jwt-verify';
import { LoggedIn } from '../middlewares/logged-in';
import { validationCheck } from '../middlewares/validation-check';
import { ErrorMsg } from '../services/database.service';
import Types from '../types';
import { Difficulty } from '../../../common/communication/difficulty';
import { DrawMode } from '../../../common/communication/draw-mode';
@injectable()
export class PictureWordController {
  router: Router;

  constructor(
    @inject(Types.AvatarService) private pictureWordService: PictureWordService,
    @inject(Types.LoggedIn) private loggedIn: LoggedIn,
  ) {
    this.configureRouter();
  }

  private configureRouter(): void {
    this.router = Router();

    this.router.post('/upload/picture',
      [
        header('Content-Type').contains('application/json')
      ],
      validationCheck,
      jwtVerify,
      this.loggedIn.checkLoggedIn.bind(this.loggedIn),
      async (req: Request, res: Response, next: NextFunction) => {
        // this.avatarService.upload(req.params._id, req.params.filePath)
        //   .then((response) => {
        //     res.status(response.statusCode).json(response.documents);
        //   })
        //   .catch((err: ErrorMsg) => {
        //     res.status(err.statusCode).json(err.message);
        //   });
      });

    this.router.post('/upload/drawing',
      [
        header('Content-Type').contains('application/json'),
        body('word').exists(),
        body('drawnPaths').isArray({ min: 1 }),
        body('hints').isArray({ min: 3, max: 3 }),
        body('difficulty').isIn([
          Difficulty.EASY,
          Difficulty.INTERMEDIATE,
          Difficulty.HARD
        ]),
        body('drawMode').isIn([
          DrawMode.CONVENTIONAL,
          DrawMode.RANDOM,
          DrawMode.PANORAMIC,
          DrawMode.CENTER_FIRST,
        ])
      ],
      validationCheck,
      jwtVerify,
      this.loggedIn.checkLoggedIn.bind(this.loggedIn),
      async (req: Request, res: Response, next: NextFunction) => {
        this.pictureWordService.uploadDrawing(req.body)
          .then((response) => {
            res.status(response.statusCode).json(response.documents);
          })
          .catch((err: ErrorMsg) => {
            res.status(err.statusCode).json(err.message);
          });
      });
  }
}