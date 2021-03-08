import * as http from 'http';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { Server, Socket, ServerOptions } from 'socket.io';
import { ChatMessage } from '../../common/communication/chat-message';
import { PrivateMessage } from '../../common/communication/private-message';
import { SocketConnection } from '../../common/socketendpoints/socket-connection';
import { SocketMessages } from '../../common/socketendpoints/socket-messages';
import { FriendsList } from '../models/schemas/account';
import { GameType, Lobby, LobbyInfo, PlayerStatus } from '../models/lobby';
import { SocketFriendActions } from '../../common/socketendpoints/socket-friend-actions';
import loginsModel from '../models/schemas/logins';
import { LobbySolo } from '../models/lobby-solo';
import { LobbyClassique } from '../models/lobby-classique';
import { LobbyCoop } from '../models/lobby-coop';
import * as jwtUtils from './utils/jwt-util';
import { DatabaseService, Response } from './services/database.service';
import { SocketIdService } from './services/socket-id.service';
import Types from './types';

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

  constructor(
    @inject(Types.SocketIdService) private socketIdService: SocketIdService,
    @inject(Types.DatabaseService) private databaseService: DatabaseService
  ) { }

  init(server: http.Server): void {
    this.io = new Server(server, this.SERVER_OPTS);
    this.bindIoEvents();
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
      loginsModel.addLogout(accountIdOfSocket).catch((err) => { console.log(err); });
    }
  }

  bindIoEvents(): void {
    this.io.on(SocketConnection.CONNECTION, (socket: Socket) => {
      console.log(`Connected with ${socket.id} \n`);

      this.onConnect(socket, socket.handshake.auth.token);

      socket.on(SocketMessages.GET_ALL_LOBBIES, (callback: (lobbies: LobbyInfo[]) => void) => {
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

      socket.on(SocketMessages.CREATE_LOBBY, (accountId: string, gametype: GameType, privacySetting: boolean) => {
        let lobby;
        switch(gametype) {
          case GameType.CLASSIC: {
            lobby = new LobbyClassique(this.socketIdService, this.io, accountId, privacySetting);
            break;
          }
          case GameType.SPRINT_SOLO: {
            lobby = new LobbySolo(this.socketIdService, this.io, accountId, privacySetting);
            break;
          }
          case GameType.SPRINT_COOP: {
            lobby = new LobbyCoop(this.socketIdService, this.io, accountId, privacySetting);
            break;
          }
        }
        // player status is to be changed.
        lobby.addPlayer(accountId, PlayerStatus.DRAWER, socket);
        this.lobbyList.push(lobby);
      });

      socket.on(SocketMessages.SEND_PRIVATE_MESSAGE, (sentMsg: PrivateMessage) => {
        if (this.validateMessageLength(sentMsg)) {
          const socketOfFriend = this.socketIdService.GetSocketIdOfAccountId(sentMsg.receiverAccountId);
          if (socketOfFriend) {
            socket.to(socketOfFriend).broadcast.emit(SocketMessages.RECEIVE_PRIVATE_MESSAGE, sentMsg);
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

      socket.on(SocketConnection.DISCONNECTION, () => {
        console.log(`Disconnected : ${socket.id} \n`);
        this.onDisconnect(socket);
      });
    });
  }

  private findLobby(lobbyId: string): Lobby | undefined {
    return this.lobbyList.find((lobby) => lobby.lobbyId === lobbyId);
  }
}
