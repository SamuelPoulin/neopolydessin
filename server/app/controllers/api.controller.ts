import express from 'express';
import { inject, injectable } from 'inversify';
import { EmailService } from '../services/email.service';
import Types from '../types';
import { AvatarController } from './avatar.controller';
import { DatabaseController } from './database.controller';
import { FriendsController } from './friends.controller';
import { PictureWordController } from './picture-word.controller';

@injectable()
export class APIController {
  router: express.Router;

  constructor(
    @inject(Types.DatabaseController) private databaseController: DatabaseController,
    @inject(Types.EmailService) private emailService: EmailService,
    @inject(Types.FriendsController) private friendsController: FriendsController,
    @inject(Types.AvatarController) private avatarController: AvatarController,
    @inject(Types.PictureWordController) private pictureController: PictureWordController,
  ) {
    this.configureRouter();
  }

  private configureRouter(): void {
    this.router = express.Router();
    this.router.use('/database', this.databaseController.router);
    this.router.use('/database/friends', this.friendsController.router);
    this.router.use('/avatar', this.avatarController.router);
    this.router.use('/pictureword', this.pictureController.router);

    this.router.post('/email', async (req, res) => {
      this.emailService.sendEmail(req.body.email, req.body.dataURL, req.body.file, req.body.ext).then((returnValue: string) => {
        console.log(returnValue);
        res.send(returnValue);
      }).catch((err: Error) => {
        console.log(err.message);
        res.send(err.message);
      });
    });
  }
}
