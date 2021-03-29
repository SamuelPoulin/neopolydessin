import http from 'http';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { Server, Socket, ServerOptions } from 'socket.io';
import { Message } from '../../common/communication/chat-message';
import { PrivateMessage } from '../../common/communication/private-message';
import { SocketConnection } from '../../common/socketendpoints/socket-connection';
import { SocketMessages } from '../../common/socketendpoints/socket-messages';
import { FriendsList } from '../models/schemas/account';
import { Lobby } from '../models/lobby';
import { SocketFriendActions } from '../../common/socketendpoints/socket-friend-actions';
import loginsModel from '../models/schemas/logins';
import { LobbySolo } from '../models/lobby-solo';
import { LobbyClassique } from '../models/lobby-classique';
import { LobbyCoop } from '../models/lobby-coop';
import messagesHistoryModel from '../models/schemas/messages-history';
import { Difficulty, GameType, LobbyInfo, PlayerStatus } from '../../common/communication/lobby';
import { SocketLobby } from '../../common/socketendpoints/socket-lobby';
import * as jwtUtils from './utils/jwt-util';
import { DatabaseService, Response } from './services/database.service';
import { SocketIdService } from './services/socket-id.service';
import Types from './types';
import { Observable } from './utils/observable';
import { PictureWordService } from './services/picture-word.service';

@injectable()
export class SocketIo {

  static GAME_SUCCESSFULLY_ENDED: Observable<string> = new Observable();
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
  ) { }

  init(server: http.Server): void {
    this.io = new Server(server, this.SERVER_OPTS);
    this.bindIoEvents();

    SocketIo.CLIENT_CONNECTED.subscribe((socket: Socket) => {
      console.log(`Connected with ${socket.id} \n`);
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
    });
  }

  sendFriendListTo(endpoint: SocketFriendActions, accountId: string, friends: Response<FriendsList>): void {
    const socketId = this.socketIdService.GetSocketIdOfAccountId(accountId);
    if (socketId) {
      this.io.to(socketId).emit(endpoint, friends);
    }
  }

  private bindIoEvents(): void {
    this.io.on(SocketConnection.CONNECTION, (socket: Socket) => {

      this.onConnect(socket, socket.handshake.auth.token);

      socket.on(SocketLobby.GET_ALL_LOBBIES, (gameMode: GameType, difficulty: Difficulty,
        callback: (lobbies: LobbyInfo[]) => void) => {
        callback(this.lobbyList
          .filter((lobby) => {
            return !lobby.privateLobby && lobby.difficulty === difficulty && gameMode === lobby.gameType;
          }).map((lobby) => {
            return lobby.getLobbySummary();
          }));;
      });

      socket.on(SocketLobby.JOIN_LOBBY, async (lobbyId: string) => {
        const lobbyToJoin = this.findLobby(lobbyId);
        const playerId: string | undefined = this.socketIdService.GetAccountIdOfSocketId(socket.id);
        if (lobbyToJoin && playerId && !lobbyToJoin.findPlayerById(playerId) && lobbyToJoin.lobbyHasRoom()) {
          lobbyToJoin.addPlayer(playerId, PlayerStatus.PASSIVE, socket);
        } else {
          console.error('coudln\'t add player to lobby');
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
                  playerId, difficulty, privacySetting, lobbyName);
                break;
              }
              case GameType.SPRINT_SOLO: {
                lobby = new LobbySolo(this.socketIdService, this.databaseService, this.pictureWordService, this.io,
                  playerId, difficulty, privacySetting, lobbyName);
                break;
              }
              case GameType.SPRINT_COOP: {
                lobby = new LobbyCoop(this.socketIdService, this.databaseService, this.pictureWordService, this.io,
                  playerId, difficulty, privacySetting, lobbyName);
                break;
              }
            }
            lobby.addPlayer(playerId, PlayerStatus.DRAWER, socket);
            this.lobbyList.push(lobby);
          } else {
            console.error('player doesn\'t exist');
          }
        });

      socket.on(SocketMessages.SEND_PRIVATE_MESSAGE, (sentMsg: PrivateMessage) => {
        if (this.validateMessageLength(sentMsg)) {
          const socketOfFriend = this.socketIdService.GetSocketIdOfAccountId(sentMsg.receiverAccountId);
          if (socketOfFriend) {
            const senderAccountId = this.socketIdService.GetAccountIdOfSocketId(socket.id);
            if (senderAccountId) {
              messagesHistoryModel.addMessageToHistory(sentMsg, senderAccountId).then((result) => {
                if (result.nModified === 0) throw new Error('couldn\'t update history');
                socket.to(socketOfFriend).broadcast.emit(SocketMessages.RECEIVE_PRIVATE_MESSAGE, sentMsg, senderAccountId);
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

      socket.on(SocketConnection.DISCONNECTING, () => {
        this.onDisconnecting(socket);
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

  private findLobby(lobbyId: string): Lobby | undefined {
    return this.lobbyList.find((lobby) => lobby.lobbyId === lobbyId);
  }

  private validateMessageLength(msg: Message): boolean {
    return msg.content.length <= this.MAX_LENGTH_MSG;
  }

}
