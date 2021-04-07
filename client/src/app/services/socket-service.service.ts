import { Injectable } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Coordinate } from '@utils/math/coordinate';
import { SocketMessages } from '@common/socketendpoints/socket-messages';
import { SocketDrawing } from '@common/socketendpoints/socket-drawing';
import { BrushInfo } from '@common/communication/brush-info';
import { ChatMessage, SystemMessage } from '@common/communication/chat-message';
import { SocketLobby } from '@common/socketendpoints/socket-lobby';
import {
  CurrentGameState,
  Difficulty,
  GameType,
  GuessMessage,
  GuessMessageSoloCoop,
  LobbyInfo,
  Player,
  TeamScore,
  TimeInfo,
} from '../../../../common/communication/lobby';
import { UserService } from './user.service';

@Injectable()
export class SocketService {
  private static API_BASE_URL: string;

  socket: Socket;
  loggedOutSubscription: Subscription;
  loggedInSubscription: Subscription;

  constructor(private userService: UserService) {
    SocketService.API_BASE_URL = environment.socketUrl;

    this.initSocket();

    this.loggedOutSubscription = this.userService.loggedOut.subscribe(() => this.socket.disconnect());
    this.loggedInSubscription = this.userService.loggedIn.subscribe(() => this.initSocket());
  }

  initSocket() {
    this.socket = io(SocketService.API_BASE_URL, {
      reconnectionDelayMax: 10000,
      transports: ['websocket'],
      auth: { token: this.userService.accessToken },
    });
  }

  receiveMessage(): Observable<ChatMessage> {
    return new Observable<ChatMessage>((obs) => {
      this.socket.on(SocketMessages.RECEIVE_MESSAGE, (content: ChatMessage) => obs.next(content));
    });
  }

  receiveWord(): Observable<string> {
    return new Observable<string>((obs) => {
      this.socket.on(SocketLobby.UPDATE_WORD_TO_DRAW, (word: string) => obs.next(word));
    });
  }

  receiveGameEnd(): Observable<boolean> {
    return new Observable<boolean>((obs) => {
      this.socket.on(SocketLobby.END_GAME, () => obs.next(true));
    });
  }

  receiveGameStart(): Observable<boolean> {
    return new Observable<boolean>((obs) => {
      this.socket.on(SocketLobby.START_GAME_CLIENT, () => obs.next(true));
    });
  }

  receiveGuess(): Observable<GuessMessage> {
    return new Observable<GuessMessage>((obs) => {
      this.socket.on(SocketLobby.CLASSIQUE_GUESS_BROADCAST, (content: GuessMessage) => obs.next(content));
      this.socket.on(SocketLobby.SOLO_COOP_GUESS_BROADCAST, (content: GuessMessageSoloCoop) => obs.next(content));
    });
  }

  receiveScores(): Observable<TeamScore[]> {
    return new Observable<TeamScore[]>((obs) => {
      this.socket.on(SocketLobby.UPDATE_TEAMS_SCORE, (scores: TeamScore[]) => obs.next(scores));
    });
  }

  receivePrivateMessage(): Observable<ChatMessage> {
    return new Observable<ChatMessage>((obs) => {
      this.socket.on(SocketMessages.RECEIVE_PRIVATE_MESSAGE, (content: ChatMessage) => obs.next(content));
    });
  }

  receiveNextTimestamp(): Observable<TimeInfo> {
    return new Observable<TimeInfo>((obs) => {
      this.socket.on(SocketLobby.SET_TIME, (timeInfo: TimeInfo) => obs.next(timeInfo));
    });
  }

  receivePlayerConnections(): Observable<SystemMessage> {
    return new Observable<SystemMessage>((obs) => {
      this.socket.on(SocketMessages.PLAYER_CONNECTION, (playerInfo: Player, timeStamp: number) =>
        obs.next({
          timestamp: timeStamp,
          content: `${playerInfo.username} a rejoint la discussion.`,
        }),
      );
    });
  }

  leaveLobby(): void {
    this.socket.emit(SocketLobby.LEAVE_LOBBY);
  }

  receivePlayerDisconnections(): Observable<SystemMessage> {
    return new Observable<SystemMessage>((obs) => {
      this.socket.on(SocketMessages.PLAYER_DISCONNECTION, (username: string, timeStamp: number) =>
        obs.next({ timestamp: timeStamp, content: `${username} a quitté la discussion.` }),
      );
    });
  }

  joinLobby(lobbyId: string) {
    this.socket.emit(SocketLobby.JOIN_LOBBY, lobbyId);
  }

  getLobbyList(gameType?: GameType, difficulty?: Difficulty): Observable<LobbyInfo[]> {
    return new Observable<LobbyInfo[]>((obs) => {
      this.socket.emit(SocketLobby.GET_ALL_LOBBIES, { gameType, difficulty }, (lobbies: LobbyInfo[]) => obs.next(lobbies));
      this.socket.on(SocketLobby.UPDATE_LOBBIES, (lobbies: LobbyInfo[]) => obs.next(lobbies));
    });
  }

  sendMessage(message: string): void {
    this.socket.emit(SocketMessages.SEND_MESSAGE, { content: message });
  }

  sendGuess(guess: string) {
    this.socket.emit(SocketLobby.PLAYER_GUESS, guess);
  }

  sendReady() {
    this.socket.emit(SocketLobby.LOADING_OVER);
  }

  async createLobby(name: string, gameMode: GameType, difficulty: Difficulty): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.socket.emit(SocketLobby.CREATE_LOBBY, name, gameMode, difficulty, false);
      resolve();
    });
  }

  getPlayerJoined(): Observable<Player> {
    return new Observable<Player>((obs) => {
      this.socket.on(SocketMessages.PLAYER_CONNECTION, (player: Player) => {
        // todo - use new format
        obs.next(player);
      });
    });
  }

  getLobbyInfo(): Observable<Player[]> {
    return new Observable<Player[]>((obs) => {
      this.socket.on(SocketLobby.RECEIVE_LOBBY_INFO, (players: Player[]) => {
        obs.next(players);
      });
    });
  }

  receiveRoles(): Observable<Player[]> {
    return new Observable<Player[]>((obs) => {
      this.socket.on(SocketLobby.UPDATE_ROLES, (players: Player[]) => {
        obs.next(players);
      });
    });
  }

  startGame(): void {
    this.socket.emit(SocketLobby.START_GAME_SERVER);
  }

  receiveGameState(): Observable<CurrentGameState> {
    return new Observable<CurrentGameState>((obs) => {
      this.socket.on(SocketLobby.UPDATE_GAME_STATE, (gameState: CurrentGameState) => {
        obs.next(gameState);
      });
    });
  }

  receiveStartPath(): Observable<{ id: number; coord: Coordinate; brush: BrushInfo }> {
    return new Observable<{ id: number; coord: Coordinate; brush: BrushInfo }>((obs) => {
      this.socket.on(SocketDrawing.START_PATH_BC, (id: number, zIndex: number, coord: Coordinate, brush: BrushInfo) => {
        obs.next({ id, coord, brush });
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

  receiveAddPath(): Observable<{ id: number; path: Coordinate[]; brush: BrushInfo }> {
    return new Observable<{ id: number; path: Coordinate[]; brush: BrushInfo }>((obs) => {
      this.socket.on(SocketDrawing.ADD_PATH_BC, (id: number, path: Coordinate[], brush: BrushInfo) => {
        obs.next({ id, path, brush });
      });
    });
  }

  receiveRemovePath(): Observable<number> {
    return new Observable<number>((obs) => {
      this.socket.on(SocketDrawing.ERASE_ID_BC, (id: number) => {
        obs.next(id);
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

  sendAddPath(id: number): void {
    this.socket.emit(SocketDrawing.ADD_PATH, id);
  }

  sendRemovePath(id: number): void {
    this.socket.emit(SocketDrawing.ERASE_ID, id);
  }
}
