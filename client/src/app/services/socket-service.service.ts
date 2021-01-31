import { Injectable } from '@angular/core';
import { Manager, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private readonly url: string = 'http://p3-204-dev.duckdns.org/';

  socket: Socket;
  manager: Manager;

  constructor() {
    this.manager = new Manager(this.url, {
      reconnectionDelayMax: 10000,
    });

    this.socket = this.manager.socket('/');
  }
}
