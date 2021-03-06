import http from 'http';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { Server, Socket, ServerOptions } from 'socket.io';
import { Message } from '../../common/communication/chat-message';
import { PrivateMessage, PrivateMessageTo } from '../../common/communication/private-message';
import { SocketConnection } from '../../common/socketendpoints/socket-connection';
import { SocketMessages } from '../../common/socketendpoints/socket-messages';
import { Friend, FriendsList, FriendStatus, FriendWithConnection } from '../../common/communication/friends';
import { Lobby } from '../models/lobby';
import { NotificationType, SocketFriendActions, SocketFriendListNotifications } from '../../common/socketendpoints/socket-friend-actions';
import loginsModel from '../models/schemas/logins';
import { LobbySolo } from '../models/lobby-solo';
import { LobbyClassique } from '../models/lobby-classique';
import { LobbyCoop } from '../models/lobby-coop';
import messagesHistoryModel from '../models/schemas/messages-history';
import { CurrentGameState, Difficulty, GameType, LobbyInfo, LobbyOpts } from '../../common/communication/lobby';
import { SocketLobby } from '../../common/socketendpoints/socket-lobby';
import { AccountFriend } from '../../common/communication/account';
import * as jwtUtils from './utils/jwt-util';
import { DatabaseService, Response } from './services/database.service';
import { SocketIdService } from './services/socket-id.service';
import Types from './types';
import { Observable } from './utils/observable';
import { PictureWordService } from './services/picture-word.service';
import { AvatarService } from './services/avatar.service';
import { ChatRoomService, GENERAL_CHAT_ROOM } from './services/chat-room.service';
@injectable()
export class SocketIo {

  static FRIEND_LIST_NOTIFICATION: Observable<{ accountId: string; friendId: string; type: NotificationType }> = new Observable();
  static GAME_SUCCESSFULLY_ENDED: Observable<string> = new Observable();
  static UPDATE_GAME_LIST: Observable<void> = new Observable();
  static CLIENT_CONNECTED: Observable<Socket> = new Observable();
  static CLIENT_DISCONNECTED: Observable<Socket> = new Observable();

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
    @inject(Types.DatabaseService) private databaseService: DatabaseService,
    @inject(Types.PictureWordService) private pictureWordService: PictureWordService,
    @inject(Types.ChatRoomService) private chatRoomService: ChatRoomService,
  ) { }

  init(server: http.Server): void {
    this.io = new Server(server, this.SERVER_OPTS);
    this.bindIoEvents();
    this.chatRoomService.initIo(this.io);

    SocketIo.CLIENT_CONNECTED.subscribe((socket: Socket) => {
      console.log(`Connected with ${socket.id} \n`);
    });

    SocketIo.UPDATE_GAME_LIST.subscribe(() => {
      const updatedLobbies = this.lobbyList
        .filter((lobby) => {
          return !lobby.privateLobby && lobby.gameType !== GameType.SPRINT_SOLO
            && lobby.currentGameState === CurrentGameState.LOBBY && lobby.lobbyHasRoom();
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

  checkOnlineStatus(friends: Friend[]): FriendWithConnection[] {
    return friends.map((friend) => {
      let isOnline: boolean = false;
      if (friend && friend.status !== FriendStatus.PENDING && friend.friendId) {
        if (this.socketIdService.GetSocketIdOfAccountId(friend.friendId._id.toString())) {
          isOnline = true;
        }
      }
      return {
        friendId: friend.friendId,
        status: friend.status,
        received: friend.received,
        isOnline
      } as FriendWithConnection;
    });
  }

  private bindIoEvents(): void {
    this.io.on(SocketConnection.CONNECTION, (socket: Socket) => {

      this.onConnect(socket, socket.handshake.auth.token);
      this.chatRoomService.bindIoEvents(socket);

      socket.on(SocketLobby.GET_ALL_LOBBIES, (lobbyOpts: LobbyOpts, callback: (lobbiesCallback: LobbyInfo[]) => void) => {
        let lobbies = this.lobbyList.filter((lobby) => !lobby.privateLobby && lobby.currentGameState === CurrentGameState.LOBBY);
        lobbies = lobbyOpts.gameType ? lobbies.filter((lobby) => lobby.gameType === lobbyOpts.gameType) : lobbies;
        lobbies = lobbyOpts.difficulty ? lobbies.filter((lobby) => lobby.difficulty === lobbyOpts.difficulty) : lobbies;
        callback(lobbies.map((lobby) => lobby.getLobbySummary()));
      });

      socket.on(SocketLobby.JOIN_LOBBY, async (lobbyId: string, callback: (lobbyInfo: LobbyInfo | null) => void) => {
        const lobbyToJoin = this.findLobby(lobbyId);
        const playerId: string | undefined = this.socketIdService.GetAccountIdOfSocketId(socket.id);
        if (lobbyToJoin && playerId && this.canJoinLobby(lobbyToJoin, playerId)) {
          lobbyToJoin.addPlayer(playerId, socket);
          callback(lobbyToJoin.getLobbySummary());
        } else {
          callback(null);
        }
      });

      socket.on(SocketLobby.CREATE_LOBBY, async (lobbyName: string, gametype: GameType, difficulty: Difficulty, privacySetting: boolean,
        callback: (lobbyInfo: LobbyInfo | null) => void) => {
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
          callback(lobby.getLobbySummary());
        } else {
          callback(null);
        }
      });

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
          console.log(`Message trop long (+${this.MAX_LENGTH_MSG} caract??res)`);
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
      socket.join(GENERAL_CHAT_ROOM);
      loginsModel.addLogin(accountId)
        .then(() => { SocketIo.CLIENT_CONNECTED.notify(socket); })
        .catch((err) => { throw Error(err); });

      this.databaseService.getAccountById(accountId)
        .then((account) => {
          DatabaseService.FRIEND_LIST_NOTIFICATION.notify({
            accountId,
            friends: account.documents.friends,
            type: NotificationType.userConnected
          });
        });
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
      this.databaseService.getAccountById(accountIdOfSocket)
        .then((account) => {
          DatabaseService.FRIEND_LIST_NOTIFICATION.notify({
            accountId: accountIdOfSocket,
            friends: account.documents.friends,
            type: NotificationType.userDisconnected
          });
        });
      this.socketIdService.DisconnectAccountIdSocketId(socket.id);
      loginsModel.addLogout(accountIdOfSocket)
        .then(() => { SocketIo.CLIENT_DISCONNECTED.notify(socket); })
        .catch((err) => console.log(err));
    }
  }

  private findLobby(lobbyId: string): Lobby | undefined {
    return this.lobbyList.find((lobby) => lobby.lobbyId === lobbyId);
  }

  private canJoinLobby(lobby: Lobby, playerId: string): boolean {
    return !lobby.findPlayerById(playerId) && lobby.lobbyHasRoom() && lobby.currentGameState === CurrentGameState.LOBBY;
  }

  private validateMessageLength(msg: Message): boolean {
    return msg.content.length <= this.MAX_LENGTH_MSG;
  }
}
