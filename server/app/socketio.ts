import * as http from 'http';
import { injectable } from 'inversify';
import 'reflect-metadata';
import { Server, Socket } from 'socket.io';
import { Lobby } from '../models/lobby';
import { SocketIdService } from './services/socket-id.service';

@injectable()
export class SocketIo {

    io: Server;
    lobbyList: Lobby[] =  [];

    constructor(private socketIdService: SocketIdService) { }

    init(server: http.Server): void {
        this.io = new Server(server, {
            cors: {
                origin: '*'
            }
        });
        this.bindIoEvents();
    }

    bindIoEvents(): void {
        this.io.on('connection', (socket: Socket, name: string) => {
            console.log(`Connected with ${socket.id} \n`);

            this.socketIdService.AssociateSocketIdName(socket.id, name);

            socket.on('GetLobbies', () => {
                this.io.to(socket.id).emit('SendLobbies', this.lobbyList);
            }); // Put gametype in enum

            socket.on('NewPlayer', (playerName: string, lobbyId: string) => {
                // console.log(playerName);

                socket.join(lobbyId);

                const playerLobby = this.lobbyList.find((e) => e.lobbyId === lobbyId);
                if (playerLobby) {
                    playerLobby.players.push(playerName);
                }
                socket.to(lobbyId).broadcast.emit('PlayerConnected', playerName); // Send to all clients except sender
            });

            socket.on('CreateLobby', (playerName: string, type: string, sizeGame: number) => {
                const generatedId = 'e';
                const lobby = { lobbyId: generatedId, players: [], size: sizeGame, gameType: type} as Lobby;
                this.lobbyList.push(lobby);
                const playerLobby = this.lobbyList.find((e) => e.lobbyId === generatedId);
                if (playerLobby) {
                    playerLobby.players.push(playerName);
                }
                socket.join(generatedId);
            });

            socket.on('ChatMessage', (messageReceived: string, timeStamp: string, playerName: string) => {
                console.log(messageReceived);
                socket.broadcast.emit('msg', { msg: messageReceived, name: playerName, time: timeStamp });
            });

            socket.on('disconnect', () => {
                console.log(`Disconnected : ${socket.id} \n`);
                this.socketIdService.DisconnectSocketIdName(socket.id);
                socket.broadcast.emit('PlayerDisconnected', this.socketIdService.GetNameOfSocketId(socket.id));
            });
        });
    }
}
