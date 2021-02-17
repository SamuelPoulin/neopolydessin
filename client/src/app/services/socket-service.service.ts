import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Manager, Socket } from 'socket.io-client';
import { ChatMessage, Message } from '../../../../common/communication/chat-message';
import { SocketMessages } from '../../../../common/socketendpoints/socket-messages';
import {
  SocketConnection,
  PlayerConnectionResult,
  PlayerConnectionStatus,
} from '../../../../common/socketendpoints/socket-connection';

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
      this.socket.on(SocketMessages.RECEIVE_MESSAGE, (content: ChatMessage) =>
        msgObs.next(content)
      );
    });
  }

  receivePlayerConnections(): Observable<Message> {
    return new Observable<Message>((msgObs) => {
      this.socket.on(SocketMessages.PLAYER_CONNECTION, (username: string) =>
        msgObs.next({timestamp: Date.now(), content: `${username} a rejoint la discussion.`})
      );
    });
  }

  receivePlayerDisconnections(): Observable<Message> {
    return new Observable<Message>((msgObs) => {
      this.socket.on(SocketMessages.PLAYER_DISCONNECTION, (username: string) =>
        msgObs.next({timestamp: Date.now(), content: `${username} a quitté la discussion.`})
      );
    });
  }

  sendMessage(message: ChatMessage): void {
    this.socket.emit(SocketMessages.SEND_MESSAGE, message);
  }

  async newPlayer(username: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.socket.emit(
        SocketConnection.PLAYER_CONNECTION,
        username,
        (data: PlayerConnectionResult) =>
          resolve(data.status === PlayerConnectionStatus.VALID)
      );
    });
  }
}
