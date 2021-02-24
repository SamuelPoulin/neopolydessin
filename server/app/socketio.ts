import * as http from 'http';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4} from 'uuid';
import { ChatMessage } from '../../common/communication/chat-message';
import { PrivateMessage } from '../../common/communication/private-message';
import { SocketConnection } from '../../common/socketendpoints/socket-connection';
import { SocketMessages } from '../../common/socketendpoints/socket-messages';
import { Lobby } from '../models/lobby';
import { DatabaseService } from './services/database.service';
import { SocketIdService } from './services/socket-id.service';
import Types from './types';

@injectable()
export class SocketIo {

  io: Server;
  lobbyList: Lobby[] =  [];
  readonly MAX_LENGHT_MSG: number = 200;

  constructor(
    @inject(Types.SocketIdService) private socketIdService: SocketIdService,
    @inject(Types.DatabaseService) private databaseService: DatabaseService
  ) { }

  init(server: http.Server): void {
    this.io = new Server(server, {
      cors: {
        origin: '*'
      },
      transports: ['websocket']
    });
    this.bindIoEvents();
  }

  bindIoEvents(): void {
    this.io.on(SocketConnection.CONNECTION, (socket: Socket, accessToken: string) => {
      console.log(`Connected with ${socket.id} \n`);

      this.socketIdService.AssociateAccountIdToSocketId(accessToken, socket.id);

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

        /* for (const value of this.players.values()) {
                if (value === playerName) {
                  callback({
                    status: 'Invalid'
                  });
                  return;
                }
              }
              callback({
                status: 'Valid'
              });
              socket.join('Prototype');
              this.players.set(socket.id, playerName);
              socket.broadcast.emit(SocketMessages.PLAYER_CONNECTION, playerName);*/
      });

      socket.on('CreateLobby', (accountId: string, type: string, sizeGame: number) => {
        this.databaseService.getAccountById(accountId).then((account) => {
          const generatedId = uuidv4();
          const lobby: Lobby = {lobbyId: generatedId, players: [], size: sizeGame, gameType: type};
          this.lobbyList.push(lobby);
          const playerLobby = this.lobbyList.find((e) => e.lobbyId === generatedId);
          if (playerLobby) {
            playerLobby.players.push(account.documents.username);
          }
          socket.join(generatedId);
        });
      });

      socket.on(SocketMessages.SEND_MESSAGE, (sentMsg: ChatMessage) => {
        if (sentMsg.content.length <= this.MAX_LENGHT_MSG) {
          const clientRooms = socket.rooms;
          socket.to(clientRooms[Object.keys(clientRooms)[0]]).broadcast.emit(SocketMessages.RECEIVE_MESSAGE, sentMsg);
        }
        else {
          console.log('Message trop long (+200 caractères)');
        }
      });

      socket.on(SocketMessages.SEND_PRIVATE_MESSAGE, (sentMsg: PrivateMessage) => {
        if (sentMsg.content.length <= this.MAX_LENGHT_MSG) {
          const socketOfFriend = this.socketIdService.GetSocketIdOfAccountId(sentMsg.receiverAccountId);
          if (socketOfFriend) {
            socket.to(socketOfFriend).broadcast.emit(SocketMessages.RECEIVE_PRIVATE_MESSAGE, sentMsg);
          }
        }
        else {
          console.log('Message trop long (+200 caractères)');
        }
      });

      socket.on(SocketConnection.DISCONNECTION, () => {
        console.log(`Disconnected : ${socket.id} \n`);
        const accountIdOfSocket = this.socketIdService.GetAccountIdOfSocketId(socket.id);
        if (accountIdOfSocket) {
          this.databaseService.getAccountById(accountIdOfSocket).then((account) => {
            socket.broadcast.emit(SocketMessages.PLAYER_DISCONNECTION, account.documents.username);
            this.socketIdService.DisconnectAccountIdSocketId(socket.id);
          });
        }
      });
    });
  }
}
