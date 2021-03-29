import path from 'path';
import fs from 'fs';
import express from 'express';
import { header } from 'express-validator';
import { inject, injectable } from 'inversify';
import multer, { diskStorage, Multer, StorageEngine } from 'multer';
import { ContentType } from '../../models/schemas/avatar';
import { jwtVerify } from '../middlewares/jwt-verify';
import { LoggedIn } from '../middlewares/logged-in';
import { validationCheck } from '../middlewares/validation-check';
import { AvatarService } from '../services/avatar.service';
import { ErrorMsg } from '../services/database.service';
import Types from '../types';

export const AVATAR_PATH = '/var/www/Polydessin/avatars';

const validPicture = (fileType: string, fileName: string): boolean => {
  const fileExtension = path.extname(fileName);
  return (fileType === ContentType.png && fileExtension === '.png') || (fileType === ContentType.jpeg || fileExtension === '.jpg');
};

@injectable()
export class AvatarController {
  router: express.Router;

  pictureStorage: StorageEngine;

  uploadPicture: Multer;

  private avatarPath: string;

  constructor(
    @inject(Types.AvatarService) private avatarService: AvatarService,
    @inject(Types.LoggedIn) private loggedIn: LoggedIn,
  ) {
    this.avatarPath = AVATAR_PATH;
    this.setupPictureStorage();
    this.configureRouter();
  }

  setAvatarPath(avatarPath: string) {
    this.avatarPath = avatarPath;
    this.checkForAvatarFolder();
  }

  private checkForAvatarFolder(): void {
    if (!fs.existsSync(this.avatarPath)) {
      try {
        fs.mkdirSync(this.avatarPath, { recursive: true });
      }
      catch (e) {
        console.error(e);
      }
    }
  }

  private setupPictureStorage(): void {
    this.pictureStorage = diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.avatarPath);
      },
      filename: (req, file, cb) => {
        // remove already existing file if there are any.
        // With this, one user can only have one uploaded avatar at a time.
        const filePath = `${this.avatarPath}/${req.params._id}`;
        if (fs.existsSync(`${filePath}.png`)) {
          fs.unlinkSync(`${filePath}.png`);
        }
        if (fs.existsSync(`${filePath}.jpg`)) {
          fs.unlinkSync(`${filePath}.jpg`);
        }

        const fileName: string = `${req.params._id}${path.extname(file.originalname)}`;
        req.params.filePath = `${this.avatarPath}/${fileName}`;
        cb(null, fileName);
      }
    });
    this.uploadPicture = multer({
      storage: this.pictureStorage,
      fileFilter: (req, file, cb) => {
        if (validPicture(file.mimetype, file.originalname)) {
          cb(null, true);
        } else {
          cb(null, false);
        }
      }
    });
  }

  private configureRouter(): void {
    this.router = express.Router();

    this.router.post('/upload',
      [
        header('Content-Type').contains('multipart/form-data')
      ],
      validationCheck,
      jwtVerify,
      this.loggedIn.checkLoggedIn.bind(this.loggedIn),
      this.uploadPicture.single('file'),
      async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.avatarService.upload(req.params._id, req.params.filePath)
          .then((response) => {
            res.status(response.statusCode).json(response.documents);
          })
          .catch((err: ErrorMsg) => {
            res.status(err.statusCode).json(err.message);
          });
      });

    this.router.get('/:id',
      jwtVerify,
      this.loggedIn.checkLoggedIn.bind(this.loggedIn),
      async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        this.avatarService.getAvatar(req.params.id)
          .then((response) => {
            res.status(response.statusCode).sendFile(path.resolve(response.documents));
          })
          .catch((err: ErrorMsg) => {
            res.status(err.statusCode).json(err.message);
          });
      });
  }

}