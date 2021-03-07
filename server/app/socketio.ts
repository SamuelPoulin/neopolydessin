import * as http from 'http';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { Server, Socket, ServerOptions } from 'socket.io';
import { ChatMessage } from '../../common/communication/chat-message';
import { PrivateMessage } from '../../common/communication/private-message';
import { SocketConnection } from '../../common/socketendpoints/socket-connection';
import { SocketMessages } from '../../common/socketendpoints/socket-messages';
import { FriendsList } from '../models/schemas/account';
import { Lobby, LobbyInfo, PlayerStatus } from '../models/lobby';
import { SocketFriendActions } from '../../common/socketendpoints/socket-friend-actions';
import loginsModel from '../models/schemas/logins';
import messagesHistoryModel from '../models/schemas/messages-history';
import * as jwtUtils from './utils/jwt-util';
import { DatabaseService, Response } from './services/database.service';
import { SocketIdService } from './services/socket-id.service';
import Types from './types';
import { Observable } from './utils/observable';

@injectable()
export class SocketIo {

  io: Server;
  lobbyList: Lobby[] = [];
  readonly MAX_LENGTH_MSG: number = 200;
  readonly SERVER_OPTS: Partial<ServerOptions> = {
    cors: {
      origin: '*'
    },
    transports: ['websocket']
  };

  clientSuccessfullyDisconnected: Observable<Socket> = new Observable();

  constructor(
    @inject(Types.SocketIdService) private socketIdService: SocketIdService,
    @inject(Types.DatabaseService) private databaseService: DatabaseService
  ) { }

  init(server: http.Server): void {
    this.io = new Server(server, this.SERVER_OPTS);
    this.bindIoEvents();
    this.clientSuccessfullyDisconnected.subscribe((socket: Socket) => {
      console.log(`Disconnected : ${socket.id} \n`);
    });
  }

  validateMessageLength(msg: ChatMessage): boolean {
    return msg.content.length <= this.MAX_LENGTH_MSG;
  }

  sendFriendListTo(endpoint: SocketFriendActions, accountId: string, friends: Response<FriendsList>): void {
    const socketId = this.socketIdService.GetSocketIdOfAccountId(accountId);
    if (socketId) {
      this.io.to(socketId).emit(endpoint, friends);
    }
  }

  onConnect(socket: Socket, accessToken: string) {
    try {
      const accountId = jwtUtils.decodeAccessToken(accessToken);
      this.socketIdService.AssociateAccountIdToSocketId(accountId, socket.id);
      loginsModel.addLogin(accountId).catch((err) => { console.log(err); });
    } catch (err) {
      console.log(err.message);
      socket.disconnect();
    }
  }

  onDisconnect(socket: Socket) {
    const accountIdOfSocket = this.socketIdService.GetAccountIdOfSocketId(socket.id);
    if (accountIdOfSocket) {
      socket.rooms.forEach((room) => {
        const lobby = this.findLobby(room);
        if (lobby) {
          lobby.removePlayer(accountIdOfSocket, socket);
        }
      });
      this.databaseService.getAccountById(accountIdOfSocket).then((account) => {
        socket.broadcast.emit(SocketMessages.PLAYER_DISCONNECTION, account.documents.username);
        this.socketIdService.DisconnectAccountIdSocketId(socket.id);
        this.socketIdService.DisconnectSocketFromLobby(socket.id);
      });
      loginsModel.addLogout(accountIdOfSocket)
        .then(() => {
          this.clientSuccessfullyDisconnected.notify(socket);
        })
        .catch((err) => console.log(err));
    }
  }

  bindIoEvents(): void {
    this.io.on(SocketConnection.CONNECTION, (socket: Socket) => {
      console.log(`Connected with ${socket.id} \n`);

      this.onConnect(socket, socket.handshake.auth.token);

      socket.on('GetLobbies', (callback: (lobbies: LobbyInfo[]) => void) => {
        callback(this.lobbyList.map((lobby) => {
          return lobby.toLobbyInfo();
        }));
      });

      socket.on(SocketConnection.PLAYER_CONNECTION, (accountId: string, lobbyId: string) => {
        const lobbyToJoin = this.findLobby(lobbyId);
        if (lobbyToJoin) {
          // player status is to be changed.
          lobbyToJoin.addPlayer(accountId, PlayerStatus.GUESSER, socket);
          this.databaseService.getAccountById(accountId).then((account) => {
            socket.to(lobbyId).broadcast.emit(SocketMessages.PLAYER_CONNECTION, account.documents.username);
          });
        }
      });

      socket.on('CreateLobby', (accountId: string) => {
        const lobby: Lobby = new Lobby(this.io);
        // player status is to be changed.
        lobby.addPlayer(accountId, PlayerStatus.DRAWER, socket);
        this.lobbyList.push(lobby);
      });

      socket.on(SocketMessages.SEND_MESSAGE, (sentMsg: ChatMessage) => {
        if (this.validateMessageLength(sentMsg)) {
          const currentLobby = this.socketIdService.GetCurrentLobbyOfSocket(socket.id);
          if (currentLobby) {
            socket.to(currentLobby).broadcast.emit(SocketMessages.RECEIVE_MESSAGE, sentMsg);
          }
        }
        else {
          console.log(`Message trop long (+${this.MAX_LENGTH_MSG} caractères)`);
        }
      });

      socket.on(SocketMessages.SEND_PRIVATE_MESSAGE, (sentMsg: PrivateMessage) => {
        if (this.validateMessageLength(sentMsg)) {
          const socketOfFriend = this.socketIdService.GetSocketIdOfAccountId(sentMsg.receiverAccountId);
          if (socketOfFriend) {
            messagesHistoryModel.addMessageToHistory(sentMsg).then((result) => {
              if (result.nModified === 0) throw new Error('couldn\'t update history');
              socket.to(socketOfFriend).broadcast.emit(SocketMessages.RECEIVE_PRIVATE_MESSAGE, sentMsg);
            }).catch((err) => {
              console.log(err);
            });
          }
        }
        else {
          console.log(`Message trop long (+${this.MAX_LENGTH_MSG} caractères)`);
        }
      });

      socket.on(SocketMessages.START_GAME_SERVER, (callback) => {
        const currentLobby = this.socketIdService.GetCurrentLobbyOfSocket(socket.id);
        if (currentLobby) {
          this.io.in(currentLobby).emit(SocketMessages.START_GAME_CLIENT);
        }
      });

      socket.on(SocketMessages.PLAYER_GUESS, (word: string) => {
        console.log(word);
      });

      socket.on(SocketConnection.DISCONNECTION, () => {
        this.onDisconnect(socket);
      });
    });
  }

  private findLobby(lobbyId: string): Lobby | undefined {
    return this.lobbyList.find((lobby) => lobby.lobbyId === lobbyId);
  }
}
