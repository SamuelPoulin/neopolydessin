import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Manager, Socket } from 'socket.io-client';
import { ChatMessage } from '../../../../common/communication/chat-message';
import { SocketMessages } from '../../../../common/socketendpoints/socket-messages';

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
      transports: ['websocket'],
    });

    this.socket = this.manager.socket('/');
  }

  receiveMessage(): Observable<ChatMessage> {
    return new Observable<ChatMessage>((msgObs) => {
      this.socket.on(SocketMessages.RECEIVE_MESSAGE, (content: ChatMessage) => msgObs.next(content));
    });
  }

  sendMessage(message: ChatMessage): void {
    this.socket.emit(SocketMessages.SEND_MESSAGE, message);
  }
}
