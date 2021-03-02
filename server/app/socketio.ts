import * as http from 'http';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { Server, Socket, ServerOptions } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage } from '../../common/communication/chat-message';
import { PrivateMessage } from '../../common/communication/private-message';
import { SocketConnection } from '../../common/socketendpoints/socket-connection';
import { SocketMessages } from '../../common/socketendpoints/socket-messages';
import { FriendsList } from '../models/account';
import { Lobby } from '../models/lobby';
import { SocketFriendActions } from '../../common/socketendpoints/socket-friend-actions';
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
      this.databaseService.addLogin(accountId);
    } catch (err) {
      console.log(err.message);
    }
  }

  onDisconnect(socket: Socket) {
    const accountIdOfSocket = this.socketIdService.GetAccountIdOfSocketId(socket.id);
    if (accountIdOfSocket) {
      this.databaseService.getAccountById(accountIdOfSocket).then((account) => {
        socket.broadcast.emit(SocketMessages.PLAYER_DISCONNECTION, account.documents.username);
        this.socketIdService.DisconnectAccountIdSocketId(socket.id);
      });
      this.databaseService.addLogout(accountIdOfSocket);
    }
  }

  bindIoEvents(): void {
    this.io.on(SocketConnection.CONNECTION, (socket: Socket) => {
      console.log(`Connected with ${socket.id} \n`);

      this.onConnect(socket, socket.handshake.auth.token);

      socket.on('GetLobbies', () => {
        this.io.to(socket.id).emit('SendLobbies', this.lobbyList);
      }); // Put gametype in enum

      socket.on(SocketConnection.PLAYER_CONNECTION, (accountId: string, lobbyId: string, callback) => {
        this.databaseService.getAccountById(accountId).then((account) => {
          socket.join(lobbyId);
          const playerLobby = this.lobbyList.find((e) => e.lobbyId === lobbyId);
          if (playerLobby) {
            playerLobby.players.push(accountId);
          }
          socket.to(lobbyId).broadcast.emit(SocketMessages.PLAYER_CONNECTION, account.documents.username);
        });
      });

      socket.on('CreateLobby', (accountId: string, type: string, sizeGame: number) => {
        this.databaseService.getAccountById(accountId).then((account) => {
          const generatedId = uuidv4();
          const lobby: Lobby = { lobbyId: generatedId, players: [], size: sizeGame, gameType: type };
          this.lobbyList.push(lobby);
          const playerLobby = this.lobbyList.find((e) => e.lobbyId === generatedId);
          if (playerLobby) {
            playerLobby.players.push(account.documents.username);
          }
          socket.join(generatedId);
        });
      });

      socket.on(SocketMessages.SEND_MESSAGE, (sentMsg: ChatMessage) => {
        if (this.validateMessageLength(sentMsg)) {
          const clientRooms = socket.rooms;
          socket.to(clientRooms[Object.keys(clientRooms)[0]]).broadcast.emit(SocketMessages.RECEIVE_MESSAGE, sentMsg);
        }
        else {
          console.log(`Message trop long (+${this.MAX_LENGTH_MSG} caractères)`);
        }
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

      socket.on(SocketConnection.DISCONNECTION, () => {
        console.log(`Disconnected : ${socket.id} \n`);
        this.onDisconnect(socket);
      });
    });
  }
}
