import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Manager, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Coordinate } from '@utils/math/coordinate';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ChatMessage, Message } from '../../../../common/communication/chat-message';
import { SocketMessages } from '../../../../common/socketendpoints/socket-messages';
import { SocketDrawing } from '../../../../common/socketendpoints/socket-drawing';
import { SocketConnection, PlayerConnectionResult, PlayerConnectionStatus } from '../../../../common/socketendpoints/socket-connection';
import { Difficulty, GameType, LobbyInfo, Player } from '../../../../common/communication/lobby';
import { ACCESS_TOKEN_REFRESH_INTERVAL } from '../../../../common/communication/login';
import { LocalSaveService } from './localsave.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private static API_BASE_URL: string;
  private jwtService: JwtHelperService;

  socket: Socket;
  manager: Manager;

  constructor(private localSaveService: LocalSaveService, private userService: UserService) {
    SocketService.API_BASE_URL = environment.socketUrl;
    this.jwtService = new JwtHelperService();

    this.manager = new Manager(SocketService.API_BASE_URL, {
      reconnectionDelayMax: 10000,
      transports: ['websocket'],
    });

    this.socket = this.manager.socket('/', {
      auth: {
        token: this.localSaveService.accessToken,
      },
    });

    this.refreshToken();

    setInterval(() => {
      this.refreshToken();
    }, ACCESS_TOKEN_REFRESH_INTERVAL);
  }

  refreshToken(): void {
    if (this.jwtService.isTokenExpired(this.localSaveService.accessToken)) {
      this.userService.refreshToken(this.localSaveService.refreshToken);
    }
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
