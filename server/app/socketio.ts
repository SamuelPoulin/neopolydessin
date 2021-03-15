import * as http from 'http';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { Server, Socket, ServerOptions } from 'socket.io';
import { ChatMessage } from '../../common/communication/chat-message';
import { PrivateMessage } from '../../common/communication/private-message';
import { SocketConnection } from '../../common/socketendpoints/socket-connection';
import { SocketMessages } from '../../common/socketendpoints/socket-messages';
import { FriendsList } from '../models/schemas/account';
import { Difficulty, GameType, Lobby, LobbyInfo, PlayerStatus } from '../models/lobby';
import { SocketFriendActions } from '../../common/socketendpoints/socket-friend-actions';
import loginsModel from '../models/schemas/logins';
import { LobbySolo } from '../models/lobby-solo';
import { LobbyClassique } from '../models/lobby-classique';
import { LobbyCoop } from '../models/lobby-coop';
import messagesHistoryModel from '../models/schemas/messages-history';
import * as jwtUtils from './utils/jwt-util';
import { DatabaseService, ErrorMsg, Response } from './services/database.service';
import { SocketIdService } from './services/socket-id.service';
import Types from './types';
import { Observable } from './utils/observable';

@injectable()
export class SocketIo {

  static GAME_SUCCESSFULLY_ENDED: Observable<string> = new Observable();

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

    SocketIo.GAME_SUCCESSFULLY_ENDED.subscribe((lobbyId) => {
      console.log(`Game : ${lobbyId} ended \n`);
      const index = this.lobbyList.findIndex((game) => game.lobbyId === lobbyId);
      if (index > -1) {
        this.lobbyList.splice(index, 1);
      }
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
      console.log(`Connected with ${socket.id} \n`);
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
      this.databaseService.getAccountById(accountIdOfSocket)
        .then((account) => {
          socket.broadcast.emit(SocketMessages.PLAYER_DISCONNECTION, account.documents.username);
          this.socketIdService.DisconnectAccountIdSocketId(socket.id);
          loginsModel.addLogout(accountIdOfSocket)
            .then(() => {
              this.clientSuccessfullyDisconnected.notify(socket);
            })
            .catch((err) => console.log(err));
        })
        .catch((err: ErrorMsg) => {
          console.log(`status : ${err.statusCode} ${err.message}`);
        });
    }
  }

  bindIoEvents(): void {
    this.io.on(SocketConnection.CONNECTION, (socket: Socket) => {

      this.onConnect(socket, socket.handshake.auth.token);

      socket.on(SocketMessages.GET_ALL_LOBBIES, (gameMode: GameType, difficulty: Difficulty, callback: (lobbies: LobbyInfo[]) => void) => {
        callback(this.lobbyList
          .filter((lobby) => {
            return !lobby.privateLobby && lobby.difficulty === difficulty && gameMode === lobby.gameType;
          }).map((lobby) => {
            return lobby.toLobbyInfo();
          }));
      });

      socket.on(SocketConnection.PLAYER_CONNECTION, (lobbyId: string) => {
        const lobbyToJoin = this.findLobby(lobbyId);
        const playerId: string | undefined = this.socketIdService.GetAccountIdOfSocketId(socket.id);
        if (lobbyToJoin && playerId) {
          lobbyToJoin.addPlayer(playerId, PlayerStatus.GUESSER, socket);
          this.databaseService.getAccountById(playerId).then((account) => {
            socket.to(lobbyId).broadcast.emit(SocketMessages.PLAYER_CONNECTION, account.documents.username);
          });
        } else {
          console.error('lobby or player doesn\'t exist');
        }
      });

      socket.on(SocketMessages.CREATE_LOBBY, (gametype: GameType, difficulty: Difficulty, privacySetting: boolean) => {
        let lobby;
        const playerId: string | undefined = this.socketIdService.GetAccountIdOfSocketId(socket.id);
        console.log(playerId + ' <-----------------PLAYER ID CREATE GAME');
        if (playerId) {
          switch(gametype) {
            case GameType.CLASSIC: {
              lobby = new LobbyClassique(this.socketIdService, this.io, playerId, difficulty, privacySetting);
              break;
            }
            case GameType.SPRINT_SOLO: {
              lobby = new LobbySolo(this.socketIdService, this.io, playerId, difficulty, privacySetting);
              break;
            }
            case GameType.SPRINT_COOP: {
              lobby = new LobbyCoop(this.socketIdService, this.io, playerId, difficulty, privacySetting);
              break;
            }
          }
          lobby.addPlayer(playerId, PlayerStatus.DRAWER, socket);
          this.lobbyList.push(lobby);
        } else {
          console.error('player doesn\'t exist');
        }
        // player status is to be changed.
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

      socket.on(SocketConnection.DISCONNECTION, () => {
        this.onDisconnect(socket);
      });
    });
  }

  private findLobby(lobbyId: string): Lobby | undefined {
    return this.lobbyList.find((lobby) => lobby.lobbyId === lobbyId);
  }
}
