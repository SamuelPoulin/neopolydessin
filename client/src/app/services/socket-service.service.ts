import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Manager, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { ChatMessage, Message } from '../../../../common/communication/chat-message';
import { SocketMessages } from '../../../../common/socketendpoints/socket-messages';
import { SocketConnection, PlayerConnectionResult, PlayerConnectionStatus } from '../../../../common/socketendpoints/socket-connection';
import { Difficulty, GameType, LobbyInfo } from '../../../../common/communication/lobby';
import { LocalSaveService } from './localsave.service';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private static API_BASE_URL: string;

  socket: Socket;
  manager: Manager;

  constructor(private localSaveService: LocalSaveService) {
    SocketService.API_BASE_URL = environment.socketUrl;

    this.manager = new Manager(SocketService.API_BASE_URL, {
      reconnectionDelayMax: 10000,
      transports: ['websocket'],
    });

    this.socket = this.manager.socket('/', {
      auth: {
        token: this.localSaveService.accessToken,
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

  joinLobby(lobbyId: string) {
    this.socket.emit(SocketConnection.PLAYER_CONNECTION, lobbyId);
  }

  getLobbyList(gameType: GameType, difficulty: Difficulty): Observable<LobbyInfo[]> {
    return new Observable<LobbyInfo[]>((msgObs) => {
      this.socket.emit(SocketMessages.GET_ALL_LOBBIES, gameType, difficulty, (lobbies: LobbyInfo[]) => {
        msgObs.next(lobbies);
      });
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
}
