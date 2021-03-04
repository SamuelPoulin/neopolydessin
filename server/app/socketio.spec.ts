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
import { SocketMessages } from '../../common/socketendpoints/socket-messages';

describe.only('Socketio', () => {

    let databaseService: DatabaseService;
    let server: Server;
    let socketIo: SocketIo;
    let manager: Manager[] = [];
    let client: Socket[] = [];

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

            manager[0] = new Manager(`http://localhost:${TEST_PORT}`, {
                reconnectionDelayMax: 10000,
                transports: ['websocket'],
                multiplex: false,
            });

            manager[1] = new Manager(`http://localhost:${TEST_PORT}`, {
                reconnectionDelayMax: 10000,
                transports: ['websocket'],
            });

            server.init(TEST_PORT);

        });

        await databaseService.connectMS();
    });

    afterEach(async () => {
        socketIo.io.removeAllListeners();
        manager.forEach((manager) => { manager._close(); });
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

            client[0].close();

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
                client[0] = manager[0].socket('/', {
                    auth: {
                        token: tokens.documents.accessToken,
                    }
                });
                accountId = jwtUtils.decodeAccessToken(tokens.documents.accessToken)
            })
    })

    it('clients should be able to receive path information', (done: Mocha.Done) => {
        // server side endpoints
        socketIo.io.on(SocketConnection.CONNECTION, (socket: Socket) => {
            socket.on(SocketConnection.DISCONNECTION, () => {
                if (socketIo.io.sockets.sockets.size == 0) {
                    setTimeout(() => { done(); }, 500);
                }
            })
        });

        // client side endpoints
        let accountId: string;
        let accountId2: string;
        databaseService
            .createAccount(accountInfo)
            .then((tokens: Response<LoginTokens>) => {
                client[0] = manager[0].socket('/', {
                    auth: {
                        token: tokens.documents.accessToken,
                    }
                });
                accountId = jwtUtils.decodeAccessToken(tokens.documents.accessToken);

                client[0].on('connect', () => {
                    client[0].emit('CreateLobby', accountId)
                })

                client[0].on(SocketDrawing.START_PATH_BC, (coord: Coord) => {
                    expect(coord).to.deep.equal({ x: 0, y: 0 });
                });

                client[0].on(SocketDrawing.UPDATE_PATH_BC, (coords: Coord[]) => {
                    expect(coords).to.deep.equal([{ x: 1, y: 1 }, { x: 2, y: 2 }]);
                });

                client[0].on(SocketDrawing.END_PATH_BC, (coord: Coord) => {
                    expect(coord).to.deep.equal({ x: 3, y: 3 });
                    client[0].close();
                });

                client[0].on(SocketMessages.PLAYER_CONNECTION, (username: string) => {
                    client[0].emit(SocketDrawing.START_PATH, { x: 0, y: 0 });
                    client[0].emit(SocketDrawing.UPDATE_PATH, [{ x: 1, y: 1 }, { x: 2, y: 2 }]);
                    client[0].emit(SocketDrawing.END_PATH, { x: 3, y: 3 });
                })

                return databaseService.createAccount(otherAccountInfo)
            })
            .then((tokens: Response<LoginTokens>) => {
                client[1] = manager[1].socket('/', {
                    auth: {
                        token: tokens.documents.accessToken,
                    }
                });
                accountId2 = jwtUtils.decodeAccessToken(tokens.documents.accessToken);

                client[1].on('connect', () => {
                    client[1].emit('GetLobbies', (lobbies: LobbyInfo[]) => {
                        client[1].emit(SocketConnection.PLAYER_CONNECTION, accountId2, lobbies[0].lobbyId);
                    });
                });

                client[1].on(SocketDrawing.START_PATH_BC, (coord: Coord) => {
                    expect(coord).to.deep.equal({ x: 0, y: 0 });
                });

                client[1].on(SocketDrawing.UPDATE_PATH_BC, (coords: Coord[]) => {
                    expect(coords).to.deep.equal([{ x: 1, y: 1 }, { x: 2, y: 2 }]);
                });

                client[1].on(SocketDrawing.END_PATH_BC, (coord: Coord) => {
                    expect(coord).to.deep.equal({ x: 3, y: 3 });
                    client[1].close();
                });

            })
    })
});