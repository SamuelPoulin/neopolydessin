import 'reflect-metadata';

import { Container } from 'inversify';
import Types from './types';

import { Application } from './app';
import { APIController } from './controllers/api.controller';
import { DatabaseController } from './controllers/database.controller';
import { Server } from './server';
import { DatabaseService } from './services/database.service';
import { EmailService } from './services/email.service';
import { SocketIo } from './socketio';
import { FriendsController } from './controllers/friends.controller';
import { FriendsService } from './services/friends.service';
import { LoggedIn } from './middlewares/logged-in';
import { SocketIdService } from './services/socket-id.service';
import { DrawingCommandsService } from './services/drawing-commands.service';

export const containerBootstrapper: () => Promise<Container> = async () => {
  const container: Container = new Container();

  container.bind(Types.Server).to(Server);
  container.bind(Types.Application).to(Application);
  container.bind(Types.Socketio).to(SocketIo).inSingletonScope();
  container.bind(Types.APIController).to(APIController);
  container.bind(Types.EmailService).to(EmailService);
  container.bind(Types.DatabaseController).to(DatabaseController);
  container.bind(Types.DatabaseService).to(DatabaseService).inSingletonScope();
  container.bind(Types.FriendsController).to(FriendsController);
  container.bind(Types.FriendsService).to(FriendsService);
  container.bind(Types.LoggedIn).to(LoggedIn);
  container.bind(Types.SocketIdService).to(SocketIdService).inSingletonScope();
  container.bind(Types.DrawingCommands).to(DrawingCommandsService);

  return container;
};
