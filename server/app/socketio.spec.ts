import { expect } from 'chai';
import { describe, beforeEach } from 'mocha';
import { testingContainer } from '../test/test-utils';
import { SocketIo } from './socketio';
import { Server } from './server';
import { Manager, Socket } from 'socket.io-client'
import Types from './types';
import { DatabaseService, LoginTokens, Response, } from './services/database.service';
import { connectMS, disconnectMS } from './services/database.service.spec';
import { Account } from '../models/schemas/account';
import { TEST_PORT } from './constants';
import { accountInfo } from './services/database.service.spec';
import { SocketConnection } from '../../common/socketendpoints/socket-connection';
import * as jwtUtils from './utils/jwt-util';
import { Login } from '../models/schemas/logins';
import { otherAccountInfo } from './services/friends.service.spec';
import { GameType, LobbyInfo } from '../models/lobby';
import { SocketDrawing } from '../../common/socketendpoints/socket-drawing';
import { Coord } from '../models/commands/path';
import { SocketMessages } from '../../common/socketendpoints/socket-messages';
import { Register } from '../../common/communication/register';
import MongoMemoryServer from 'mongodb-memory-server-core';
import * as sinon from 'sinon';

export const accountInfo3: Register = {
    firstName: 'a',
    lastName: 'b',
    username: 'c',
    email: 'a@b.c',
    password: 'abcabc',
    passwordConfirm: 'abcabc',
}

describe('Socketio', () => {

    let mongoMemoryServer: MongoMemoryServer;
    let databaseService: DatabaseService;
    let server: Server;
    let socketIo: SocketIo;
    let managers: Manager[];
    let clients: Socket[];
    let nbDisconnectedClients: number;
    let addLogoutStub: sinon.SinonStub<any, any>;

    const env = Object.assign({}, process.env);
    const TEST_URL: string = `http://localhost:${TEST_PORT}`;
    const MANAGER_OPTS = {
        reconnectionDelayMax: 10000,
        transports: ['websocket'],
    }

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

            nbDisconnectedClients = 0;
            managers = [];
            clients = [];
            server.init(TEST_PORT);
        });
        mongoMemoryServer = await connectMS();
    });

    afterEach(async () => {
        if (addLogoutStub) {
            addLogoutStub.restore();
        }
        socketIo.io.removeAllListeners();
        managers.forEach((manager) => { manager._close(); });
        clients.forEach((client) => {
            if (client.connected) {
                client.close();
            }
        })
        server.close();
        await disconnectMS(mongoMemoryServer);
    })

    interface TestClient {
        accountId: string;
        socket: Socket,
    }

    const createClient = async (accountInfo: Register): Promise<TestClient> => {
        const manager = new Manager(TEST_URL, MANAGER_OPTS);
        managers.push(manager);
        const tokens: Response<LoginTokens> = await databaseService.createAccount(accountInfo)
        const socket = manager.socket('/', {
            auth: { token: tokens.documents.accessToken, }
        });
        clients.push(socket);
        const accountId = jwtUtils.decodeAccessToken(tokens.documents.accessToken)
        return { accountId, socket };
    }

    const testDoneWhenAllClientsAreDisconnected = (done: Mocha.Done) => {
        socketIo.clientSuccessfullyDisconnected.subscribe(() => {
            nbDisconnectedClients++;
            if (nbDisconnectedClients === clients.length) {
                done();
            }
        })
    }

    it('client socket connection should call addLogin and disconnection should call addLogout', (done: Mocha.Done) => {
        let accountId: string;
        socketIo.io.once(SocketConnection.CONNECTION, (socket: Socket) => {
            socket.once(SocketConnection.DISCONNECTION, () => {
                databaseService.getAccountById(accountId)
                    .then((account: Response<Account>) => {
                        const login: Login = (account.documents.logins as any).logins[0];
                        expect(login.end && login.start < login.end).to.be.true;
                        done();
                    });
            })
        })

        createClient(accountInfo).then((testClient) => {
            accountId = testClient.accountId;
            testClient.socket.on('connect', () => {
                testClient.socket.close();
            })
        });
    })

    it('clients should be able to receive path information', (done: Mocha.Done) => {
        testDoneWhenAllClientsAreDisconnected(done);
        createClient(accountInfo)
            .then((testClient) => {
                testClient.socket.on('connect', () => {
                    testClient.socket.emit(SocketMessages.CREATE_LOBBY, testClient.accountId, GameType.SPRINT_COOP, true);
                })

                testClient.socket.on(SocketDrawing.START_PATH_BC, (coord: Coord) => {
                    expect(coord).to.deep.equal({ x: 0, y: 0 });
                });

                testClient.socket.on(SocketDrawing.UPDATE_PATH_BC, (coords: Coord[]) => {
                    expect(coords).to.deep.equal([{ x: 1, y: 1 }, { x: 2, y: 2 }]);
                });

                testClient.socket.on(SocketDrawing.END_PATH_BC, (coord: Coord) => {
                    expect(coord).to.deep.equal({ x: 3, y: 3 });
                    testClient.socket.close();
                });

                testClient.socket.on(SocketMessages.PLAYER_CONNECTION, (username: string) => {
                    testClient.socket.emit(SocketDrawing.START_PATH, { x: 0, y: 0 });
                    testClient.socket.emit(SocketDrawing.UPDATE_PATH, [{ x: 1, y: 1 }, { x: 2, y: 2 }]);
                    testClient.socket.emit(SocketDrawing.END_PATH, { x: 3, y: 3 });
                })

                return createClient(otherAccountInfo);
            })
            .then((testClient) => {
                testClient.socket.on('connect', () => {
                    testClient.socket.emit('GetLobbies', (lobbies: LobbyInfo[]) => {
                        testClient.socket.emit(SocketConnection.PLAYER_CONNECTION, testClient.accountId, lobbies[0].lobbyId);
                    });
                });

                testClient.socket.on(SocketDrawing.START_PATH_BC, (coord: Coord) => {
                    expect(coord).to.deep.equal({ x: 0, y: 0 });
                });

                testClient.socket.on(SocketDrawing.UPDATE_PATH_BC, (coords: Coord[]) => {
                    expect(coords).to.deep.equal([{ x: 1, y: 1 }, { x: 2, y: 2 }]);
                });

                testClient.socket.on(SocketDrawing.END_PATH_BC, (coord: Coord) => {
                    expect(coord).to.deep.equal({ x: 3, y: 3 });
                    testClient.socket.close();
                });
            })
        done();
    })

    it('multiple lobbies should work correctly', (done: Mocha.Done) => {
        testDoneWhenAllClientsAreDisconnected(done);
        createClient(accountInfo)
            .then((testClient) => {
                testClient.socket.on('connect', () => {
                    testClient.socket.emit(SocketMessages.CREATE_LOBBY, testClient.accountId, GameType.SPRINT_COOP, true);
                })

                testClient.socket.on(SocketMessages.PLAYER_CONNECTION, (username: string) => {
                    testClient.socket.emit(SocketDrawing.START_PATH, { x: 0, y: 0 });
                })

                testClient.socket.on(SocketDrawing.START_PATH_BC, (coord: Coord) => {
                    expect(coord).to.deep.equal({ x: 0, y: 0 });
                    testClient.socket.close();
                })
                return createClient(otherAccountInfo);
            })
            .then((testClient) => {
                testClient.socket.on('connect', () => {
                    testClient.socket.emit(SocketMessages.CREATE_LOBBY, testClient.accountId, GameType.SPRINT_COOP, true);
                    testClient.socket.emit(SocketDrawing.START_PATH, { x: 0, y: 0 });
                })

                testClient.socket.on(SocketDrawing.START_PATH_BC, (coord: Coord) => {
                    expect(coord).to.deep.equal({ x: 0, y: 0 });
                    testClient.socket.close();
                })

                return createClient(accountInfo3);
            })
            .then((testClient) => {
                testClient.socket.on('connect', () => {
                    testClient.socket.emit('GetLobbies', (lobbies: LobbyInfo[]) => {
                        testClient.socket.emit(SocketConnection.PLAYER_CONNECTION, testClient.accountId, lobbies[0].lobbyId);
                    });
                });

                testClient.socket.on(SocketDrawing.START_PATH_BC, (coord: Coord) => {
                    expect(coord).to.deep.equal({ x: 0, y: 0 });
                    testClient.socket.close();
                })
            });
        done();
    });
});