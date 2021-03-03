import { expect } from 'chai';
import { describe, beforeEach } from 'mocha';
import { testingContainer } from '../test/test-utils';
import { SocketIo } from './socketio';
import { Server } from './server';
import { Manager, Socket } from 'socket.io-client'
import Types from './types';
import { DatabaseService, LoginTokens, Response, } from './services/database.service';
import { Account } from '../models/schemas/account';
import { TEST_PORT } from './constants';
import { accountInfo } from './services/database.service.spec';
import { SocketConnection } from '../../common/socketendpoints/socket-connection';
import * as jwtUtils from './utils/jwt-util';
import { Login } from '../models/schemas/logins';
import { otherAccountInfo } from './services/friends.service.spec';
import { LobbyInfo } from '../models/lobby';
import { SocketDrawing } from '../../common/socketendpoints/socket-drawing';
import { Coord } from '../models/commands/Path';

describe.only('Socketio', () => {

    let databaseService: DatabaseService;
    let server: Server;
    let socketIo: SocketIo;
    let manager: Manager;
    let client: Socket

    const env = Object.assign({}, process.env);

    before(() => {
        process.env.JWT_KEY = 'this is a super secret secret!!!';
        process.env.JWT_REFRESH_KEY = 'this is another super secret secret!!!';
    });

    after(() => {
        process.env = env;
    });

    beforeEach(async () => {
        await testingContainer().then((instance) => {
            databaseService = instance[0].get<DatabaseService>(Types.DatabaseService);
            server = instance[0].get<Server>(Types.Server);
            socketIo = instance[0].get<SocketIo>(Types.Socketio);

            manager = new Manager(`http://localhost:${TEST_PORT}`, {
                reconnectionDelayMax: 10000,
                transports: ['websocket'],
            });
            server.init(TEST_PORT);

        });

        await databaseService.connectMS();
    });

    afterEach(async () => {
        manager._close();
        server.close();
        await databaseService.disconnectDB();
    })

    it('should instantiate correctly', (done: Mocha.Done) => {
        expect(socketIo).to.be.instanceOf(SocketIo);
        done();
    });

    it('client socket connection should call addLogin and disconnection should call addLogout', (done: Mocha.Done) => {
        let accountId: string;
        socketIo.io.once(SocketConnection.CONNECTION, (socket: Socket) => {

            client.close();

            socket.once(SocketConnection.DISCONNECTION, () => {
                databaseService.getAccountById(accountId)
                    .then((account: Response<Account>) => {
                        const login: Login = (account.documents.logins as any).logins[0];
                        expect(login.end && login.start < login.end).to.be.true;
                        done();
                    });
            })
        })

        databaseService.createAccount(accountInfo)
            .then((tokens: Response<LoginTokens>) => {
                client = manager.socket('/', {
                    auth: {
                        token: tokens.documents.accessToken,
                    }
                });
                accountId = jwtUtils.decodeAccessToken(tokens.documents.accessToken)
            })
    })

    it('client should be able to join lobby', (done: Mocha.Done) => {
        let client2: Socket;
        let accountId: string;
        let accountId2: string;
        databaseService
            .createAccount(accountInfo)
            .then((tokens: Response<LoginTokens>) => {
                client = manager.socket('/', {
                    auth: {
                        token: tokens.documents.accessToken,
                    }
                });
                accountId = jwtUtils.decodeAccessToken(tokens.documents.accessToken);
                return databaseService.createAccount(otherAccountInfo)
            })
            .then((tokens: Response<LoginTokens>) => {
                client2 = manager.socket('/', {
                    auth: {
                        token: tokens.documents.accessToken,
                    }
                });
                accountId2 = jwtUtils.decodeAccessToken(tokens.documents.accessToken);


                client.on(SocketDrawing.START_PATH_BC, (coord: Coord) => {
                    expect(coord).to.deep.equal({ x: 0, y: 0 });
                })
                client.on(SocketDrawing.UPDATE_PATH_BC, (coords: Coord[]) => {
                    expect(coords).to.deep.equal([
                        { x: 1, y: 1 },
                        { x: 2, y: 2 }
                    ]);
                    console.log(coords);
                })

                client2.on(SocketDrawing.START_PATH_BC, (coord: Coord) => {
                    expect(coord).to.deep.equal({ x: 0, y: 0 });
                });
                client2.on(SocketDrawing.START_PATH_BC, (coords: Coord[]) => {
                    expect(coords).to.deep.equal([
                        { x: 1, y: 1 },
                        { x: 2, y: 2 }
                    ]);
                    console.log(coords);
                });

                client.emit('CreateLobby', accountId)

                client2.emit('GetLobbies', (lobbies: LobbyInfo[]) => {
                    console.log(lobbies);
                    client2.emit(SocketConnection.PLAYER_CONNECTION, accountId2, lobbies[0].lobbyId);
                });

                client.emit(SocketDrawing.START_PATH, { x: 0, y: 0 })
                client.emit(SocketDrawing.UPDATE_PATH, [
                    { x: 1, y: 1 },
                    { x: 2, y: 2 }
                ]);
            })
    })
});