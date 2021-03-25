import { Request, Response, NextFunction, Router } from 'express';
import { body, header } from 'express-validator';
import { inject, injectable } from 'inversify';
import { PictureWordService } from '../services/picture-word.service';
import { jwtVerify } from '../middlewares/jwt-verify';
import { LoggedIn } from '../middlewares/logged-in';
import { validationCheck } from '../middlewares/validation-check';
import { ErrorMsg } from '../services/database.service';
import Types from '../types';
import { DrawMode } from '../../../common/communication/draw-mode';
import { Difficulty } from '../../../common/communication/lobby';
@injectable()
export class PictureWordController {
  router: Router;

  constructor(
    @inject(Types.PictureWordService) private pictureWordService: PictureWordService,
    @inject(Types.LoggedIn) private loggedIn: LoggedIn,
  ) {
    this.configureRouter();
    console.log(this.pictureWordService);
    console.log(this.loggedIn);
  }

  private configureRouter(): void {
    this.router = Router();

    this.router.post('/upload/picture',
      [
        header('Content-Type').contains('application/json'),
        body('word').exists(),
        body('picture').isArray({ min: 1 }),
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
        this.pictureWordService.uploadPicture(req.body)
          .then((response) => {
            res.status(response.statusCode);
          })
          .catch((err: ErrorMsg) => {
            res.status(err.statusCode).json(err.message);
          });
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
            res.status(response.statusCode).json('drawing added successfully');
          })
          .catch((err: ErrorMsg) => {
            res.status(err.statusCode).json(err.message);
          });
      });
  }
}