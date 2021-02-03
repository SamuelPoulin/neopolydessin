import * as http from 'http';
import { injectable } from 'inversify';
import 'reflect-metadata';
import { Server, Socket } from 'socket.io';

@injectable()
export class SocketIo {

    io: Server;

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

            socket.on('disconnect', () => {
                console.log(`Disconnected : ${socket.id} \n`);
            });
        });
    }
}
