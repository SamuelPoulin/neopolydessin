import { expect } from 'chai';
import { describe, beforeEach } from 'mocha';
import { testingContainer } from '../test/test-utils';
import { SocketIo } from './socketio';
import { Server } from './server';
import { Manager, Socket } from 'socket.io-client'
import Types from './types';
import { DatabaseService, ErrorMsg, LoginTokens, Response, } from './services/database.service';
import { connectMS, disconnectMS } from './services/database.service.spec';
import { Account, FriendsList, FriendStatus } from '../models/schemas/account';
import { TEST_PORT } from './constants';
import { accountInfo } from './services/database.service.spec';
import { SocketConnection } from '../../common/socketendpoints/socket-connection';
import * as jwtUtils from './utils/jwt-util';
import { Login } from '../models/schemas/logins';
import { otherAccountInfo } from './services/friends.service.spec';
import { Difficulty, GameType, LobbyInfo } from '../models/lobby';
import { SocketDrawing } from '../../common/socketendpoints/socket-drawing';
import { Coord } from '../models/commands/path';
import { SocketMessages } from '../../common/socketendpoints/socket-messages';
import { Register } from '../../common/communication/register';
import MongoMemoryServer from 'mongodb-memory-server-core';
import { PrivateMessage } from '../../common/communication/private-message';
import { FriendsService } from './services/friends.service';
import { NOT_FOUND, OK } from 'http-status-codes';
import { SocketFriendActions } from '../../common/socketendpoints/socket-friend-actions';

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
    let friendService: FriendsService;
    let server: Server;
    let socketIo: SocketIo;
    let managers: Manager[];
    let clients: Socket[];
    let nbDisconnectedClients: number;

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
            friendService = instance[0].get<FriendsService>(Types.FriendsService);
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
        socketIo.io.removeAllListeners();
        managers.forEach((manager) => { manager._close(); });
        clients.forEach((client) => {
            if (client.connected) {
                client.close();
            }
        })
        server.close();
        await disconnectMS(mongoMemoryServer)
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
        socketIo.clientSuccessfullyDisconnected.subscribe(() => {
            databaseService.getAccountById(accountId)
                .then((account: Response<Account>) => {
                    const login: Login = (account.documents.logins as any).logins[0];
                    expect(login.end && login.start < login.end).to.be.true;
                    done();
                });
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
                    testClient.socket.emit(SocketMessages.CREATE_LOBBY, 'lobby1', GameType.SPRINT_COOP, Difficulty.EASY, false);
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

                testClient.socket.on(SocketMessages.PLAYER_CONNECTION, (lobbyId: string) => {
                    testClient.socket.emit(SocketDrawing.START_PATH, { x: 0, y: 0 });
                    testClient.socket.emit(SocketDrawing.UPDATE_PATH, [{ x: 1, y: 1 }, { x: 2, y: 2 }]);
                    testClient.socket.emit(SocketDrawing.END_PATH, { x: 3, y: 3 });
                })

                return createClient(otherAccountInfo);
            })
            .then((testClient) => {
                testClient.socket.on('connect', () => {
                    testClient.socket.emit(SocketMessages.GET_ALL_LOBBIES, GameType.SPRINT_COOP, Difficulty.EASY, (lobbies: LobbyInfo[]) => {
                        testClient.socket.emit(SocketConnection.PLAYER_CONNECTION, lobbies[0].lobbyId);
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
    })

    it('multiple lobbies should work correctly', (done: Mocha.Done) => {
        testDoneWhenAllClientsAreDisconnected(done);
        createClient(accountInfo)
            .then((testClient) => {
                testClient.socket.on('connect', () => {
                    testClient.socket.emit(SocketMessages.CREATE_LOBBY, 'lobby1', GameType.CLASSIC, Difficulty.EASY, false);
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
                    testClient.socket.emit(SocketMessages.CREATE_LOBBY, 'lobby2', GameType.CLASSIC, Difficulty.EASY, false);
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
                    testClient.socket.emit(SocketMessages.GET_ALL_LOBBIES, GameType.CLASSIC, Difficulty.EASY, (lobbies: LobbyInfo[]) => {
                        testClient.socket.emit(SocketConnection.PLAYER_CONNECTION, lobbies[0].lobbyId);
                    });
                });

                testClient.socket.on(SocketDrawing.START_PATH_BC, (coord: Coord) => {
                    expect(coord).to.deep.equal({ x: 0, y: 0 });
                    testClient.socket.close();
                })
            });
    });

    it('friendship notifications should work correctly', (done: Mocha.Done) => {
        testDoneWhenAllClientsAreDisconnected(done);
        let accountId2: string;
        createClient(accountInfo)
            .then((testClient) => {
                testClient.socket.on(SocketFriendActions.FRIEND_REQUEST_RECEIVED, (friendList: Response<FriendsList>) => {
                    expect(friendList.documents.friends[0].status).to.equal(FriendStatus.PENDING);
                    expect(friendList.documents.friends[0].received).to.be.true;
                    friendService.acceptFriendship(testClient.accountId, accountId2)
                        .then((friendList) => {
                            expect(friendList.documents.friends[0].status).to.equal(FriendStatus.FRIEND);
                            expect(friendList.documents.friends[0].received).to.be.true;
                            testClient.socket.close();
                        });
                })
                return createClient(otherAccountInfo);
            })
            .then((testClient) => {
                accountId2 = testClient.accountId;

                testClient.socket.on('connect', () => {
                    friendService.requestFriendship(accountId2, 'username');
                })

                testClient.socket.on(SocketFriendActions.FRIEND_REQUEST_ACCEPTED, (friendList: Response<FriendsList>) => {
                    expect(friendList.documents.friends[0].status).to.equal(FriendStatus.FRIEND);
                    expect(friendList.documents.friends[0].received).to.be.false;
                    testClient.socket.close();
                })
            });
    });

    it('private messages should work correctly', (done: Mocha.Done) => {
        testDoneWhenAllClientsAreDisconnected(done);
        let accountId: string;
        let accountId2: string;
        createClient(accountInfo)
            .then((testClient) => {
                accountId = testClient.accountId;

                testClient.socket.on(SocketFriendActions.FRIEND_REQUEST_RECEIVED, (friendList: Response<FriendsList>) => {
                    friendService.acceptFriendship(testClient.accountId, accountId2);
                });

                testClient.socket.on(SocketMessages.RECEIVE_PRIVATE_MESSAGE, (msg: PrivateMessage) => {
                    expect(msg.content).to.equal('bonjourhi');
                    expect(msg.receiverAccountId).to.equal(testClient.accountId);
                    expect(msg.senderAccountId).to.equal(accountId2);
                    const otherMsg: PrivateMessage = {
                        receiverAccountId: accountId2,
                        senderAccountId: accountId,
                        content: 'eyo what up',
                        timestamp: Date.now(),
                    }
                    testClient.socket.emit(SocketMessages.SEND_PRIVATE_MESSAGE, otherMsg);
                    testClient.socket.close();
                })
                return createClient(otherAccountInfo);
            })
            .then((testClient) => {
                accountId2 = testClient.accountId;

                testClient.socket.on('connect', () => {
                    friendService.requestFriendship(accountId2, 'username');
                });

                testClient.socket.on(SocketMessages.RECEIVE_PRIVATE_MESSAGE, (msg: PrivateMessage) => {
                    expect(msg.content).to.equal('eyo what up');
                    expect(msg.receiverAccountId).to.equal(testClient.accountId);
                    expect(msg.senderAccountId).to.equal(accountId);
                    friendService.getMessageHistory(accountId, accountId2, 1, 5)
                        .then((history) => {
                            expect(history.statusCode).to.equal(OK);
                            expect(history.documents.messages).to.be.lengthOf(2);
                            testClient.socket.close();
                        })
                });

                testClient.socket.on(SocketFriendActions.FRIEND_REQUEST_ACCEPTED, (friendList: Response<FriendsList>) => {
                    const msg: PrivateMessage = {
                        receiverAccountId: accountId,
                        senderAccountId: testClient.accountId,
                        content: 'bonjourhi',
                        timestamp: Date.now(),
                    }
                    testClient.socket.emit(SocketMessages.SEND_PRIVATE_MESSAGE, msg);
                });
            });
    });

    it('private message history should be deleted when unfriended', (done: Mocha.Done) => {
        testDoneWhenAllClientsAreDisconnected(done);
        let accountId: string;
        let accountId2: string;
        createClient(accountInfo)
            .then((testClient) => {
                accountId = testClient.accountId;

                testClient.socket.on(SocketFriendActions.FRIEND_REQUEST_RECEIVED, (friendList: Response<FriendsList>) => {
                    friendService.acceptFriendship(testClient.accountId, accountId2);
                });

                testClient.socket.on(SocketMessages.RECEIVE_PRIVATE_MESSAGE, (msg: PrivateMessage) => {
                    expect(msg.content).to.equal('bonjourhi');
                    expect(msg.receiverAccountId).to.equal(testClient.accountId);
                    expect(msg.senderAccountId).to.equal(accountId2);
                    friendService.unfriend(accountId, accountId2);
                    testClient.socket.close();
                })
                return createClient(otherAccountInfo);
            })
            .then((testClient) => {
                accountId2 = testClient.accountId;

                testClient.socket.on('connect', () => {
                    friendService.requestFriendship(accountId2, 'username');
                });

                testClient.socket.on(SocketFriendActions.UPDATE, (friendList: Response<FriendsList>) => {
                    friendService.getMessageHistory(accountId, accountId2, 1, 5)
                        .catch((err) => {
                            expect(err.statusCode).to.equal(NOT_FOUND);
                            testClient.socket.close();
                        })
                });

                testClient.socket.on(SocketFriendActions.FRIEND_REQUEST_ACCEPTED, (friendList: Response<FriendsList>) => {
                    const msg: PrivateMessage = {
                        receiverAccountId: accountId,
                        senderAccountId: testClient.accountId,
                        content: 'bonjourhi',
                        timestamp: Date.now(),
                    }
                    testClient.socket.emit(SocketMessages.SEND_PRIVATE_MESSAGE, msg);
                });
            });
    });

    it('private message history should be deleted when deleting account', (done: Mocha.Done) => {
        let accountId: string;
        let accountId2: string;
        let accountId3: string;

        createClient(accountInfo)
            .then((testClient) => {
                accountId = testClient.accountId;

                testClient.socket.on(SocketFriendActions.FRIEND_REQUEST_RECEIVED, (friendList: Response<FriendsList>) => {
                    friendService.acceptFriendship(testClient.accountId, accountId3);
                });

                testClient.socket.on(SocketMessages.RECEIVE_PRIVATE_MESSAGE, (msg: PrivateMessage) => {
                    testClient.socket.close();
                })
                return createClient(otherAccountInfo);
            })
            .then((testClient) => {
                accountId2 = testClient.accountId;

                testClient.socket.on(SocketFriendActions.FRIEND_REQUEST_RECEIVED, (friendList: Response<FriendsList>) => {
                    friendService.acceptFriendship(testClient.accountId, accountId3);
                });

                testClient.socket.on(SocketMessages.RECEIVE_PRIVATE_MESSAGE, (msg: PrivateMessage) => {
                    const otherMsg: PrivateMessage = {
                        receiverAccountId: accountId3,
                        senderAccountId: testClient.accountId,
                        content: 'eyo what up',
                        timestamp: Date.now(),
                    }
                    testClient.socket.emit(SocketMessages.SEND_PRIVATE_MESSAGE, otherMsg);
                    testClient.socket.close();
                })

                return createClient(accountInfo3);
            })
            .then((testClient) => {
                accountId3 = testClient.accountId;

                testClient.socket.on('connect', () => {
                    friendService.requestFriendship(accountId3, 'username')
                    friendService.requestFriendship(accountId3, 'username1');
                });

                let nbCall = 0;
                testClient.socket.on(SocketFriendActions.FRIEND_REQUEST_ACCEPTED, (friendList: Response<FriendsList>) => {
                    nbCall++;
                    if (nbCall === 2) {
                        const msg = (receiverAccountId: string) => {
                            return {
                                receiverAccountId: receiverAccountId,
                                senderAccountId: testClient.accountId,
                                content: 'bonjourhi',
                                timestamp: Date.now(),
                            }
                        };
                        testClient.socket.emit(SocketMessages.SEND_PRIVATE_MESSAGE, msg(accountId))
                        testClient.socket.emit(SocketMessages.SEND_PRIVATE_MESSAGE, msg(accountId2));
                    }
                });

                testClient.socket.on(SocketMessages.RECEIVE_PRIVATE_MESSAGE, (msg: PrivateMessage) => {
                    expect(msg.receiverAccountId).to.be.equal(testClient.accountId);
                    expect(msg.senderAccountId).to.be.equal(accountId2);
                    friendService.getMessageHistory(testClient.accountId, accountId2, 1, 5)
                        .then((history) => {
                            expect(history.documents.messages).to.be.lengthOf(2);
                            return friendService.getMessageHistory(accountId, testClient.accountId, 1, 5);
                        })
                        .then((history) => {
                            expect(history.documents.messages).to.be.lengthOf(1);
                            return databaseService.deleteAccount(accountId3);
                        })
                        .then((result) => {
                            return friendService.getMessageHistory(testClient.accountId, accountId2, 1, 5)
                        })
                        .catch((err: ErrorMsg) => {
                            expect(err.statusCode).to.be.equal(NOT_FOUND);
                            return friendService.getMessageHistory(testClient.accountId, accountId, 1, 5)
                        })
                        .catch((err: ErrorMsg) => {
                            expect(err.statusCode).to.be.equal(NOT_FOUND);
                            testClient.socket.close();
                            done();
                        });
                });
            });
    });
});