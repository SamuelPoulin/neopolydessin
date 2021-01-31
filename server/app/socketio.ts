import 'reflect-metadata';
import { injectable } from "inversify";
import * as socketio from 'socket.io';
import * as http from 'http';

@injectable()
export class SocketIo {

    io: socketio.Server;

    init(server: http.Server): void {
        this.io = require('socket.io')(server, {
            cors: {
                origin: "*"
            }
        })
        this.bindIoEvents();
    }

    bindIoEvents(): void {
        this.io.on('connection', (socket: socketio.Socket) => {
            console.log(`Connected with ${socket.id} \n`);

            socket.on('disconnect', () => {
                console.log(`Disconnected : ${socket.id} \n`);
            });
        });
    }
}