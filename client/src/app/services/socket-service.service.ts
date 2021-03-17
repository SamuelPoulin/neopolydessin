import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Manager, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Coordinate } from '@utils/math/coordinate';
import { ChatMessage, Message } from '../../../../common/communication/chat-message';
import { SocketMessages } from '../../../../common/socketendpoints/socket-messages';
import { SocketDrawing } from '../../../../common/socketendpoints/socket-drawing';
import { SocketConnection, PlayerConnectionResult, PlayerConnectionStatus } from '../../../../common/socketendpoints/socket-connection';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private static API_BASE_URL: string;
  static ACCESS_TOKEN: string;
  static REFRESH_TOKEN: string;

  socket: Socket;
  manager: Manager;

  constructor() {
    SocketService.API_BASE_URL = environment.socketUrl;

    this.manager = new Manager(SocketService.API_BASE_URL, {
      reconnectionDelayMax: 10000,
      transports: ['websocket'],
    });

    this.socket = this.manager.socket('/', {
      auth: {
        token: SocketService.ACCESS_TOKEN,
      },
    });
  }

  receiveMessage(): Observable<ChatMessage> {
    return new Observable<ChatMessage>((msgObs) => {
      this.socket.on(SocketMessages.RECEIVE_MESSAGE, (content: ChatMessage) => msgObs.next(content));
    });
  }

  receivePlayerConnections(): Observable<Message> {
    return new Observable<Message>((msgObs) => {
      this.socket.on(SocketMessages.PLAYER_CONNECTION, (username: string) =>
        msgObs.next({ timestamp: Date.now(), content: `${username} a rejoint la discussion.` }),
      );
    });
  }

  receivePlayerDisconnections(): Observable<Message> {
    return new Observable<Message>((msgObs) => {
      this.socket.on(SocketMessages.PLAYER_DISCONNECTION, (username: string) =>
        msgObs.next({ timestamp: Date.now(), content: `${username} a quitté la discussion.` }),
      );
    });
  }

  sendMessage(message: ChatMessage): void {
    this.socket.emit(SocketMessages.SEND_MESSAGE, message);
  }

  async newPlayer(username: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.socket.emit(SocketConnection.PLAYER_CONNECTION, username, (data: PlayerConnectionResult) =>
        resolve(data.status === PlayerConnectionStatus.VALID),
      );
    });
  }

  async createLobby(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.socket.emit(SocketMessages.CREATE_LOBBY, 'classic', 'easy', false, (data: string) => resolve(data));
    });
  }

  receiveStartPath(): Observable<Coordinate> {
    return new Observable<Coordinate>((obs) => {
      this.socket.on(SocketDrawing.START_PATH_BC, (coord: Coordinate) => {
        obs.next(coord);
      });
    });
  }

  receiveUpdatePath(): Observable<Coordinate> {
    return new Observable<Coordinate>((obs) => {
      this.socket.on(SocketDrawing.UPDATE_PATH_BC, (coord: Coordinate) => {
        obs.next(coord);
      });
    });
  }

  receiveEndPath(): Observable<Coordinate> {
    return new Observable<Coordinate>((obs) => {
      this.socket.on(SocketDrawing.END_PATH_BC, (coord: Coordinate) => {
        obs.next(coord);
      });
    });
  }

  sendStartPath(coord: Coordinate): void {
    this.socket.emit(SocketDrawing.START_PATH, coord);
  }

  sendUpdatePath(coord: Coordinate): void {
    this.socket.emit(SocketDrawing.UPDATE_PATH, coord);
  }

  sendEndPath(coord: Coordinate): void {
    this.socket.emit(SocketDrawing.END_PATH, coord);
  }
}
