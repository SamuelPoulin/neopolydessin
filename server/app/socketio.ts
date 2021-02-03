import * as http from 'http';
import { injectable } from 'inversify';
import 'reflect-metadata';
import { Server, Socket } from 'socket.io';

@injectable()
export class SocketIo {

    io: Server;
    players: string[] = [];

    init(server: http.Server): void {
        this.io = new Server(server, {
            cors: {
                origin: '*'
            }
        });
        this.bindIoEvents();
    }

    bindIoEvents(): void {
        this.io.on('connection', (socket: Socket) => {
            console.log(`Connected with ${socket.id} \n`);

            socket.on('NewPlayer', (playerName: string) => {
                console.log(playerName);
                this.players[socket.id] = playerName;
                socket.broadcast.emit('PlayerConnected', playerName); // Send to all clients except sender
            });

            socket.on('ChatMessage', (messageReceived: string) => {
                console.log(messageReceived);
                socket.broadcast.emit('msg', { msg: messageReceived, playerName: this.players[socket.id] });
            });

            socket.on('disconnect', () => {
                console.log(`Disconnected : ${socket.id} \n`);
                socket.broadcast.emit('PlayerDisconnected', this.players[socket.id]);
                this.players[socket.id] = '';
            });
        });
    }
}
