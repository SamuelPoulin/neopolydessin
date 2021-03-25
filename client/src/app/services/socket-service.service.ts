import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Manager, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Coordinate } from '@utils/math/coordinate';
import { PlayerInfo } from '../../../../common/communication/player-info';
import { ChatMessage, Message, SystemMessage } from '../../../../common/communication/chat-message';
import { SocketMessages } from '../../../../common/socketendpoints/socket-messages';
import { SocketDrawing } from '../../../../common/socketendpoints/socket-drawing';
import { SocketConnection, PlayerConnectionResult, PlayerConnectionStatus } from '../../../../common/socketendpoints/socket-connection';
import { Difficulty, GameType, LobbyInfo, Player } from '../../../../common/communication/lobby';
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

  receivePlayerConnections(): Observable<SystemMessage> {
    return new Observable<SystemMessage>((msgObs) => {
      this.socket.on(SocketMessages.PLAYER_CONNECTION, (playerInfo: PlayerInfo, timeStamp: number) =>
        msgObs.next({
          timestamp: timeStamp,
          content: `${playerInfo.playerName} a rejoint la discussion.`,
        }),
      );
    });
  }

  receivePlayerDisconnections(): Observable<SystemMessage> {
    return new Observable<SystemMessage>((msgObs) => {
      this.socket.on(SocketMessages.PLAYER_DISCONNECTION, (username: string, timeStamp: number) =>
        msgObs.next({ timestamp: timeStamp, content: `${username} a quitté la discussion.` }),
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

  sendMessage(message: Message): void {
    this.socket.emit(SocketMessages.SEND_MESSAGE, message);
  }

  async newPlayer(username: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.socket.emit(SocketConnection.PLAYER_CONNECTION, username, (data: PlayerConnectionResult) =>
        resolve(data.status === PlayerConnectionStatus.VALID),
      );
    });
  }

  async createLobby(name: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.socket.emit(SocketMessages.CREATE_LOBBY, name, 'classic', 'easy', false, (data: string) => resolve(data));
    });
  }

  getPlayerJoined(): Observable<string> {
    return new Observable<string>((obs) => {
      this.socket.on(SocketMessages.PLAYER_CONNECTION, (player: string) => {
        obs.next(player);
      });
    });
  }

  getLobbyInfo(): Observable<Player> {
    return new Observable<Player>((obs) => {
      this.socket.on(SocketMessages.RECEIVE_LOBBY_INFO, (player: Player) => {
        obs.next(player);
      });
    });
  }

  startGame(): void {
    this.socket.emit(SocketMessages.START_GAME_SERVER);
  }

  receiveStartPath(): Observable<Coordinate> {
    return new Observable<Coordinate>((obs) => {
      this.socket.on(SocketDrawing.START_PATH_BC, (id: number, coord: Coordinate) => {
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

  sendStartPath(coord: Coordinate, color: string, strokeWidth: number): void {
    this.socket.emit(SocketDrawing.START_PATH, coord, { color, strokeWidth });
  }

  sendUpdatePath(coord: Coordinate): void {
    this.socket.emit(SocketDrawing.UPDATE_PATH, coord);
  }

  sendEndPath(coord: Coordinate): void {
    this.socket.emit(SocketDrawing.END_PATH, coord);
  }
}
