import * as http from 'http';
import { injectable } from 'inversify';
import 'reflect-metadata';
import { Server, Socket } from 'socket.io';
import { ChatMessage } from '../../common/communication/chat-message';
import { SocketConnection } from '../../common/socketendpoints/socket-connection';
import { SocketMessages } from '../../common/socketendpoints/socket-messages';
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
            },
            transports: ['websocket']
        });
        this.bindIoEvents();
    }

    bindIoEvents(): void {
        this.io.on(SocketConnection.CONNECTION, (socket: Socket, name: string) => {
            console.log(`Connected with ${socket.id} \n`);

            this.socketIdService.AssociateSocketIdName(socket.id, name);

            socket.on('GetLobbies', () => {
                this.io.to(socket.id).emit('SendLobbies', this.lobbyList);
            }); // Put gametype in enum

            socket.on(SocketConnection.PLAYER_CONNECTION, (playerName: string, lobbyId: string) => {
                socket.join(lobbyId);
                const playerLobby = this.lobbyList.find((e) => e.lobbyId === lobbyId);
                if (playerLobby) {
                    playerLobby.players.push(playerName);
                }
                socket.to(lobbyId).broadcast.emit(SocketMessages.PLAYER_CONNECTION, playerName); // Send to all clients except sender
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

            socket.on(SocketMessages.SEND_MESSAGE, (sentMsg: ChatMessage) => {
                socket.broadcast.emit(SocketMessages.RECEIVE_MESSAGE, sentMsg);
            });

            socket.on(SocketConnection.DISCONNECTION, () => {
                console.log(`Disconnected : ${socket.id} \n`);
                this.socketIdService.DisconnectSocketIdName(socket.id);
                socket.broadcast.emit(SocketMessages.PLAYER_DISCONNECTION, this.socketIdService.GetNameOfSocketId(socket.id));
            });
        });
    }
}
