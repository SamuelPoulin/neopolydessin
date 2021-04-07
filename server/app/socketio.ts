/* eslint-disable max-lines */
import http from 'http';
import { id, inject, injectable } from 'inversify';
import 'reflect-metadata';
import { Server, Socket, ServerOptions } from 'socket.io';
import { ChatMessage, Message, RoomChatMessage, RoomSystemMessage, SystemMessage } from '../../common/communication/chat-message';
import { PrivateMessage, PrivateMessageTo } from '../../common/communication/private-message';
import { SocketConnection } from '../../common/socketendpoints/socket-connection';
import { SocketMessages } from '../../common/socketendpoints/socket-messages';
import { FriendsList } from '../../common/communication/friends';
import { Lobby } from '../models/lobby';
import { NotificationType, SocketFriendActions, SocketFriendListNotifications } from '../../common/socketendpoints/socket-friend-actions';
import loginsModel from '../models/schemas/logins';
import { LobbySolo } from '../models/lobby-solo';
import { LobbyClassique } from '../models/lobby-classique';
import { LobbyCoop } from '../models/lobby-coop';
import messagesHistoryModel from '../models/schemas/messages-history';
import { Difficulty, GameType, LobbyInfo, LobbyOpts } from '../../common/communication/lobby';
import { SocketLobby } from '../../common/socketendpoints/socket-lobby';
import { AccountFriend, AccountInfo } from '../../common/communication/account';
import * as jwtUtils from './utils/jwt-util';
import { DatabaseService, Response } from './services/database.service';
import { SocketIdService } from './services/socket-id.service';
import Types from './types';
import { Observable } from './utils/observable';
import { PictureWordService } from './services/picture-word.service';
import { AvatarService } from './services/avatar.service';

const GENERAL_CHAT_ROOM: string = 'general';
@injectable()
export class SocketIo {

  static FRIEND_LIST_NOTIFICATION: Observable<{ accountId: string; friendId: string; type: NotificationType }> = new Observable();
  static GAME_SUCCESSFULLY_ENDED: Observable<string> = new Observable();
  static UPDATE_GAME_LIST: Observable<void> = new Observable();
  static CLIENT_CONNECTED: Observable<Socket> = new Observable();
  static CLIENT_DISCONNECTED: Observable<Socket> = new Observable();

  io: Server;
  lobbyList: Lobby[] = [];

  rooms: string[] = [GENERAL_CHAT_ROOM];

  readonly MAX_LENGTH_MSG: number = 200;
  readonly SERVER_OPTS: Partial<ServerOptions> = {
    cors: {
      origin: '*'
    },
    transports: ['websocket']
  };

  constructor(
    @inject(Types.SocketIdService) private socketIdService: SocketIdService,
    @inject(Types.DatabaseService) private databaseService: DatabaseService,
    @inject(Types.PictureWordService) private pictureWordService: PictureWordService,
  ) { }

  init(server: http.Server): void {
    this.io = new Server(server, this.SERVER_OPTS);
    this.bindIoEvents();

    SocketIo.CLIENT_CONNECTED.subscribe((socket: Socket) => {
      console.log(`Connected with ${socket.id} \n`);
    });

    SocketIo.UPDATE_GAME_LIST.subscribe(() => {
      const updatedLobbies = this.lobbyList
        .filter((lobby) => {
          return !lobby.privateLobby && lobby.gameType !== GameType.SPRINT_SOLO && lobby.lobbyHasRoom();
        }).map((lobby) => {
          return lobby.getLobbySummary();
        });
      this.io.emit(SocketLobby.UPDATE_LOBBIES, updatedLobbies);
    });

    SocketIo.CLIENT_DISCONNECTED.subscribe((socket: Socket) => {
      console.log(`Disconnected : ${socket.id} \n`);
    });

    SocketIo.GAME_SUCCESSFULLY_ENDED.subscribe((lobbyId: string) => {
      console.log(`Game : ${lobbyId} ended \n`);
      const index = this.lobbyList.findIndex((game) => game.lobbyId === lobbyId);
      if (index > -1) {
        this.lobbyList.splice(index, 1);
      }
      SocketIo.UPDATE_GAME_LIST.notify();
    });

    DatabaseService.FRIEND_LIST_NOTIFICATION.subscribe(
      (obj: { accountId: string; friends: AccountFriend[]; type: NotificationType }) => {
        obj.friends.forEach((friend) => {
          const socketId = this.socketIdService.GetSocketIdOfAccountId(friend.friendId);
          if (socketId) {
            this.io.to(socketId).emit(SocketFriendListNotifications.NOTIFICATION_RECEIVED, obj.type, obj.accountId);
          }
        });
      });

    SocketIo.FRIEND_LIST_NOTIFICATION.subscribe(
      (obj: { accountId: string; friendId: string; type: NotificationType }) => {
        const socketId = this.socketIdService.GetSocketIdOfAccountId(obj.friendId);
        if (socketId) {
          this.io.to(socketId).emit(SocketFriendListNotifications.NOTIFICATION_RECEIVED, obj.type, obj.accountId);
        }
      });

    AvatarService.USER_UPDATED_AVATAR.subscribe(async (obj: { accountId: string; avatarId: string }) => {
      const account = await this.databaseService.getAccountById(obj.accountId);
      account.documents.friends.forEach((friend) => {
        const socketId = this.socketIdService.GetSocketIdOfAccountId(friend.friendId as string);
        if (socketId) {
          this.io.to(socketId).emit(SocketFriendListNotifications.INVALIDATE_AVATAR, obj.accountId, obj.avatarId);
        }
      });
    });
  }

  sendFriendListTo(endpoint: SocketFriendActions, accountId: string, friends: Response<FriendsList>): void {
    const socketId = this.socketIdService.GetSocketIdOfAccountId(accountId);
    if (socketId) {
      this.io.to(socketId).emit(endpoint, friends.documents);
    }
  }

  private bindIoEvents(): void {
    this.io.on(SocketConnection.CONNECTION, (socket: Socket) => {

      this.onConnect(socket, socket.handshake.auth.token);

      socket.on(SocketLobby.GET_ALL_LOBBIES, (lobbyOpts: LobbyOpts, callback: (lobbiesCallback: LobbyInfo[]) => void) => {
        let lobbies = this.lobbyList.filter((lobby) => !lobby.privateLobby);
        lobbies = lobbyOpts.gameType ? lobbies.filter((lobby) => lobby.gameType === lobbyOpts.gameType) : lobbies;
        lobbies = lobbyOpts.difficulty ? lobbies.filter((lobby) => lobby.difficulty === lobbyOpts.difficulty) : lobbies;
        callback(lobbies.map((lobby) => lobby.getLobbySummary()));
      });

      socket.on(SocketLobby.JOIN_LOBBY, async (lobbyId: string) => {
        const lobbyToJoin = this.findLobby(lobbyId);
        const playerId: string | undefined = this.socketIdService.GetAccountIdOfSocketId(socket.id);
        if (lobbyToJoin && playerId && !lobbyToJoin.findPlayerById(playerId) && lobbyToJoin.lobbyHasRoom()) {
          lobbyToJoin.addPlayer(playerId, socket);
        } else {
          console.error('couldn\'t add player to lobby');
        }
      });

      socket.on(SocketLobby.CREATE_LOBBY,
        async (lobbyName: string, gametype: GameType, difficulty: Difficulty, privacySetting: boolean) => {
          let lobby: Lobby;
          const playerId: string | undefined = this.socketIdService.GetAccountIdOfSocketId(socket.id);
          if (playerId) {
            switch (gametype) {
              case GameType.CLASSIC: {
                lobby = new LobbyClassique(this.socketIdService, this.databaseService, this.pictureWordService, this.io,
                  difficulty, privacySetting, lobbyName);
                break;
              }
              case GameType.SPRINT_SOLO: {
                lobby = new LobbySolo(this.socketIdService, this.databaseService, this.pictureWordService, this.io,
                  difficulty, privacySetting, lobbyName);
                break;
              }
              case GameType.SPRINT_COOP: {
                lobby = new LobbyCoop(this.socketIdService, this.databaseService, this.pictureWordService, this.io,
                  difficulty, privacySetting, lobbyName);
                break;
              }
            }
            lobby.addPlayer(playerId, socket);
            this.lobbyList.push(lobby);
          } else {
            console.error('player doesn\'t exist');
          }
        });

      // ***************************************
      // CHAT SYSTEM ENDPOINTS
      // ***************************************
      socket.on(SocketMessages.SEND_PRIVATE_MESSAGE, (sentMsg: PrivateMessageTo) => {
        if (this.validateMessageLength(sentMsg)) {
          const socketOfFriend = this.socketIdService.GetSocketIdOfAccountId(sentMsg.receiverAccountId);
          if (socketOfFriend) {
            const senderAccountId = this.socketIdService.GetAccountIdOfSocketId(socket.id);
            const receiverAccountId = this.socketIdService.GetAccountIdOfSocketId(socketOfFriend);
            if (senderAccountId && receiverAccountId) {
              const timestamp = Date.now();
              const privateMsg: PrivateMessage = {
                content: sentMsg.content,
                senderAccountId,
                receiverAccountId,
                timestamp,
              };
              messagesHistoryModel.addMessageToHistory(sentMsg, senderAccountId, receiverAccountId, timestamp).then((result) => {
                if (result.nModified === 0) throw new Error('couldn\'t update history');
                socket.to(socketOfFriend).emit(SocketMessages.RECEIVE_PRIVATE_MESSAGE, privateMsg);
                socket.emit(SocketMessages.RECEIVE_PRIVATE_MESSAGE, privateMsg);
              }).catch((err) => {
                console.log(err);
              });
            }
          }
        }
        else {
          console.log(`Message trop long (+${this.MAX_LENGTH_MSG} caractères)`);
        }
      });

      socket.on(SocketMessages.GET_CHAT_ROOMS_IM_IN, (callback: (rooms: string[]) => void) => {
        const roomsImIn: string[] = [];
        socket.rooms.forEach((room) => {
          if (this.chatRoomExists(room)) {
            roomsImIn.push(room);
          }
        });
        callback(roomsImIn);
      });

      socket.on(SocketMessages.GET_CHAT_ROOMS, (callback: (rooms: string[]) => void) => {
        callback(this.rooms);
      });

      socket.on(SocketMessages.CREATE_CHAT_ROOM, (roomName: string, callback: (successfullyCreated: boolean) => void) => {
        if (!this.chatRoomExists(roomName)) {
          this.rooms.push(roomName);
          // create chat history for room
          callback(true);
        } else {
          callback(false);
        }
      });

      socket.on(SocketMessages.DELETE_CHAT_ROOM, (roomName: string, callback: (successfullyDeleted: boolean) => void) => {
        if (this.chatRoomExists(roomName) && roomName !== GENERAL_CHAT_ROOM) {
          const roomIndex = this.rooms.findIndex((room) => room === roomName);
          if (roomIndex > -1) {
            this.io.of('/').in(roomName).sockets.forEach((socketOfClient) => {
              socketOfClient.leave(roomName);
            });
            this.rooms.splice(roomIndex, 1);
            // delete chat history
            callback(true);
          }
        } else {
          callback(false);
        }
      });

      socket.on(SocketMessages.LEAVE_CHAT_ROOM, (roomName: string, callback: (successfullyLeft: boolean) => void) => {
        if (this.chatRoomExists(roomName) && socket.rooms.has(roomName)) {
          socket.leave(roomName);
          callback(true);
        } else {
          callback(false);
        }
      });

      socket.on(SocketMessages.JOIN_CHAT_ROOM, async (roomName: string, successfullyJoined: (joined: boolean) => void) => {
        if (this.chatRoomExists(roomName)) {
          const accountInfo = await this.getAccountOfUser(socket);
          if (accountInfo) {
            socket.join(roomName);
            const playerJoinedMsg: RoomSystemMessage = {
              roomName,
              content: `${accountInfo.username} a rejoint le salon : ${roomName}`,
              timestamp: Date.now(),
            };
            this.io.in(roomName).emit(SocketMessages.RECEIVE_MESSAGE_OF_ROOM, playerJoinedMsg);
            successfullyJoined(true);
          } else {
            successfullyJoined(false);
          }
        }
      });

      socket.on(SocketMessages.LEAVE_CHAT_ROOM, async (roomName, successfullyLeave: (joined: boolean) => void) => {
        if (socket.rooms.has(roomName)) {
          const accountInfo = await this.getAccountOfUser(socket);
          if (accountInfo) {
            socket.leave(roomName);
            const playerLeft: RoomSystemMessage = {
              roomName,
              content: `${accountInfo.username} a quitté le salon : ${roomName}`,
              timestamp: Date.now(),
            };
            this.io.in(roomName).emit(SocketMessages.RECEIVE_MESSAGE_OF_ROOM, playerLeft);
            successfullyLeave(true);
          } else {
            successfullyLeave(false);
          }
        }
      });

      socket.on(SocketMessages.SEND_MESSAGE_TO_ROOM, async (roomName: string, message: Message) => {
        if (this.chatRoomExists(roomName)) {
          const accountInfo = await this.getAccountOfUser(socket);
          if (accountInfo) {
            const roomMsg: RoomChatMessage = {
              content: message.content,
              timestamp: Date.now(),
              senderUsername: accountInfo.username,
              roomName
            };
            // add to history
            this.io.in(roomName).emit(SocketMessages.RECEIVE_MESSAGE_OF_ROOM, roomMsg);
          }
        }
      });

      socket.on(SocketConnection.DISCONNECTING, () => {
        this.onDisconnecting(socket);
      });

      socket.on(SocketLobby.ACCEPT_INVITE, (lobbyIdToJoin: string, callback: (lobbyJoined: boolean) => void) => {
        const lobbyToJoin = this.findLobby(lobbyIdToJoin);
        const playerId: string | undefined = this.socketIdService.GetAccountIdOfSocketId(socket.id);
        if (lobbyToJoin && playerId && !lobbyToJoin.findPlayerById(playerId) && lobbyToJoin.lobbyHasRoom()) {
          lobbyToJoin.addPlayer(playerId, socket);
          callback(true);
        }
        else {
          callback(false);
        }
      });

      socket.on(SocketConnection.DISCONNECTION, () => {
        this.onDisconnect(socket);
      });
    });
  }

  private onConnect(socket: Socket, accessToken: string) {
    try {
      const accountId = jwtUtils.decodeAccessToken(accessToken);
      this.socketIdService.AssociateAccountIdToSocketId(accountId, socket.id);
      loginsModel.addLogin(accountId)
        .then(() => { SocketIo.CLIENT_CONNECTED.notify(socket); })
        .catch((err) => { throw Error(err); });
    } catch (err) {
      console.error(err.message);
      socket.disconnect();
    }
  }

  private onDisconnecting(socket: Socket) {
    const accountIdOfSocket = this.socketIdService.GetAccountIdOfSocketId(socket.id);
    if (accountIdOfSocket) {
      socket.rooms.forEach((room) => {
        const lobby = this.findLobby(room);
        if (lobby) {
          lobby.removePlayer(accountIdOfSocket, socket);
        }
      });
    }
  }

  private onDisconnect(socket: Socket) {
    const accountIdOfSocket = this.socketIdService.GetAccountIdOfSocketId(socket.id);
    if (accountIdOfSocket) {
      this.socketIdService.DisconnectAccountIdSocketId(socket.id);
      loginsModel.addLogout(accountIdOfSocket)
        .then(() => { SocketIo.CLIENT_DISCONNECTED.notify(socket); })
        .catch((err) => console.log(err));
    }
  }

  private async getAccountOfUser(socket: Socket): Promise<AccountInfo | undefined> {
    const accountId = this.socketIdService.GetAccountIdOfSocketId(socket.id);
    if (accountId) {
      const account = await this.databaseService.getAccountById(accountId);
      return account.documents;
    } else {
      return undefined;
    }
  }

  private findLobby(lobbyId: string): Lobby | undefined {
    return this.lobbyList.find((lobby) => lobby.lobbyId === lobbyId);
  }

  private validateMessageLength(msg: Message): boolean {
    return msg.content.length <= this.MAX_LENGTH_MSG;
  }

  private chatRoomExists(roomName: string): boolean {
    return this.rooms.includes(roomName);
  }

}
