import * as http from 'http';
import { injectable } from 'inversify';
import 'reflect-metadata';
import { Server, Socket } from 'socket.io';
import { ChatMessage } from '../../common/communication/chat-message';
import { SocketConnection } from '../../common/socketendpoints/socket-connection';
import { SocketMessages } from '../../common/socketendpoints/socket-messages';

@injectable()
export class SocketIo {

  io: Server;
  players: Map<string, string> = new Map<string, string>();
  readonly MAX_LENGHT_MSG: number = 200;

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
    this.io.on(SocketConnection.CONNECTION, (socket: Socket) => {
      console.log(`Connected with ${socket.id} \n`);

      socket.on(SocketConnection.PLAYER_CONNECTION, (playerName: string, callback) => {
        for (const value of this.players.values()) {
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
        socket.to('Prototype').broadcast.emit(SocketMessages.PLAYER_CONNECTION, playerName);
      });

      socket.on(SocketMessages.SEND_MESSAGE, (sentMsg: ChatMessage) => {
        if (sentMsg.content.length <= this.MAX_LENGHT_MSG) {
          socket.to('Prototype').broadcast.emit(SocketMessages.RECEIVE_MESSAGE, sentMsg);
          console.log('Message trop long (+200 caractères)');
        }
      });

      socket.on(SocketConnection.DISCONNECTION, () => {
        console.log(`Disconnected : ${socket.id} \n`);
        if (this.players.get(socket.id)) {
          socket.to('Prototype').broadcast.emit(SocketMessages.PLAYER_DISCONNECTION, this.players.get(socket.id));
          this.players.delete(socket.id);
        }
      });
    });
  }
}