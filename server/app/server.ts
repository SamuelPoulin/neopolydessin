import http from 'http';
import { inject, injectable } from 'inversify';
import { Application } from './app';
import Types from './types';

import { DEV_PORT, PROD_PORT } from './constants';
import { SocketIo } from './socketio';

@injectable()
export class Server {

  isListening: boolean;

  private server: http.Server;
  private port: number;


  constructor(
    @inject(Types.Application) private application: Application,
    @inject(Types.Socketio) private socketio: SocketIo
  ) {
    this.isListening = false;
  }

  static get port(): number {
    let port: number;

    if (process.env.DEPLOY === 'prod') {
      port = PROD_PORT;
    } else {
      port = DEV_PORT;
    }
    return port;
  }

  init(port: number): void {
    this.port = port;

    this.application.app.set('port', this.port);

    this.server = http.createServer(this.application.app);
    this.server.on('error', (error: NodeJS.ErrnoException) => this.onError(error));
    this.server.on('listening', () => this.onListening());
    this.server.listen(this.port);
    this.socketio.init(this.server);
  }

  close(): void {
    this.server.close();
  }

  private onError(error: NodeJS.ErrnoException): void {
    if (error.syscall !== 'listen') {
      throw error;
    }
    switch (error.code) {
      case 'EACCES':
        console.error(`Port ${this.port} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`Port ${this.port} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

  private onListening(): void {
    this.isListening = true;
    console.log(`Listening on port ${this.port}`);
  }
}
