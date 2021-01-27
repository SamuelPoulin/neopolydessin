import * as fs from 'fs';
import { Container } from 'inversify';
import 'reflect-metadata';
import { containerBootstrapper } from './inversify.config';
import { Server } from './server';
import Types from './types';

void (async () => {
  try {
    process.env.MONGODB_KEY = fs.readFileSync('mongo.env').toString();
  } catch (err) {
    console.log('Could not load an API env file. Make sure both env files are under server/ Exiting...');
    process.exit(0);
  }

  const container: Container = await containerBootstrapper();
  const server: Server = container.get<Server>(Types.Server);

  server.init(Server.port);
})();
