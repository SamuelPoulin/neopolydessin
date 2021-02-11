import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Manager, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private readonly url: string = 'http://p3-204-dev.duckdns.org/';
  // private readonly url: string = 'http://localhost:3205/';

  socket: Socket;
  manager: Manager;

  constructor() {
    this.manager = new Manager(this.url, {
      reconnectionDelayMax: 10000,
    });

    this.socket = this.manager.socket('/');

    // this.socket.on('PlayerConnected', (playerName: string) => {

    // });
  }

  receiveMessage(): Observable<string> {
    return new Observable<string>((msgObs) => {
      this.socket.on('msg', (content: string) => msgObs.next(content));
    });
  }

  sendMessage(message: string): void {
    this.socket.emit('ChatMessage', message);
  }
}
