import { expect } from 'chai';
import { describe, beforeEach } from 'mocha';
import { testingContainer } from '../test/test-utils';
import { SocketIo } from './socketio';
import { Server } from './server';
import { Manager, Socket } from 'socket.io-client'
import Types from './types';
import { DatabaseService, ErrorMsg, Response, } from './services/database.service';
import { connectMS, disconnectMS } from './services/database.service.spec';
import { TEST_PORT } from './constants';
import { accountInfo } from './services/database.service.spec';
import * as jwtUtils from './utils/jwt-util';
import { otherAccountInfo } from './services/friends.service.spec';
import { Difficulty, GameType, LobbyInfo, Player, PlayerRole, ReasonEndGame } from '../../common/communication/lobby';
import { SocketDrawing } from '../../common/socketendpoints/socket-drawing';
import { SocketMessages } from '../../common/socketendpoints/socket-messages';
import { Register } from '../../common/communication/register';
import MongoMemoryServer from 'mongodb-memory-server-core';
import { PrivateMessage, PrivateMessageTo } from '../../common/communication/private-message';
import { FriendsService } from './services/friends.service';
import { NOT_FOUND, OK } from 'http-status-codes';
import { NotificationType, SocketFriendActions, SocketFriendListNotifications } from '../../common/socketendpoints/socket-friend-actions';
import { BrushInfo } from '../../common/communication/brush-info';
import { SocketLobby } from '../../common/socketendpoints/socket-lobby';
import { PictureWordService } from './services/picture-word.service';
import { DrawMode } from '../../common/communication/draw-mode';
import { Coord } from '../../common/communication/drawing-sequence';
import { LoginResponse } from '../../common/communication/login';
import { FriendsList, FriendStatus } from '../../common/communication/friends';

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
    let pictureWordService: PictureWordService;
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
            pictureWordService = instance[0].get<PictureWordService>(Types.PictureWordService);
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
        SocketIo.CLIENT_CONNECTED.observers = [];
        SocketIo.CLIENT_DISCONNECTED.observers = [];
        SocketIo.GAME_SUCCESSFULLY_ENDED.observers = [];

        await disconnectMS(mongoMemoryServer);
    });

    interface TestClient {
        accountId: string;
        socket: Socket,
    }

    const createClient = async (accountInfo: Register): Promise<TestClient> => {
        const manager = new Manager(TEST_URL, MANAGER_OPTS);
        managers.push(manager);
        const tokens: Response<LoginResponse> = await databaseService.createAccount(accountInfo)
        const socket = manager.socket('/', {
            auth: { token: tokens.documents.accessToken, }
        });
        clients.push(socket);
        const accountId = jwtUtils.decodeAccessToken(tokens.documents.accessToken)
        return { accountId, socket };
    }

    const testDoneWhenAllClientsAreDisconnected = (done: Mocha.Done) => {
        SocketIo.CLIENT_DISCONNECTED.subscribe(() => {
            nbDisconnectedClients++;
            if (nbDisconnectedClients === clients.length) {
                done();
            }
        })
    }

    // TODO update this test after the /dashboard endpoint exists
    // it('client socket connection should call addLogin and disconnection should call addLogout', (done: Mocha.Done) => {
    //     let accountId: string;
    //     SocketIo.CLIENT_DISCONNECTED.subscribe(() => {
    //         databaseService.getAccountById(accountId)
    //             .then((account: Response<AccountInfo>) => {
    //                 const login: Login = (account.documents.logins as any).logins[0];
    //                 expect(login.end && login.start < login.end).to.be.true;
    //                 done();
    //             });
    //     })

    //     createClient(accountInfo).then((testClient) => {
    //         accountId = testClient.accountId;
    //         testClient.socket.on('connect', () => {
    //             testClient.socket.close();
    //         })
    //     });
    // })

    it('clients should be able to receive path information', (done: Mocha.Done) => {
        pictureWordService.uploadDrawing({
            word: 'TestWord1',
            drawnPaths: [{
                id: '0',
                brushInfo: {
                    color: "#000000",
                    strokeWidth: 1
                },
                path: [
                    { x: 1, y: 1 },
                    { x: 2, y: 2 },
                    { x: 3, y: 3 }
                ]
            }],
            hints: ['Clue1', 'Clue2', 'Clue3'],
            difficulty: Difficulty.EASY,
            drawMode: DrawMode.CONVENTIONAL
        }).then(() => {
            testDoneWhenAllClientsAreDisconnected(done);
            createClient(accountInfo)
                .then((testClient) => {
                    testClient.socket.on('connect', () => {
                        testClient.socket.emit(SocketLobby.CREATE_LOBBY, 'lobby1', GameType.CLASSIC, Difficulty.EASY, false,
                            (lobbyinfo: LobbyInfo) => { });
                    })

                    testClient.socket.on(SocketDrawing.START_PATH_BC, (id: number, zIndex: number, coord: Coord, brushInfo: BrushInfo) => {
                        expect(id).to.be.equal(0);
                        expect(zIndex).to.be.equal(0);
                        expect(coord).to.deep.equal({ x: 1, y: 1 });
                        expect(brushInfo).to.be.deep.equal({ color: "#000000", strokeWidth: 1 });
                    });

                    testClient.socket.on(SocketDrawing.UPDATE_PATH_BC, (coords: Coord) => {
                        expect(coords).to.deep.equal({ x: 2, y: 2 });
                    });

                    testClient.socket.on(SocketDrawing.END_PATH_BC, (coord: Coord) => {
                        expect(coord).to.deep.equal({ x: 3, y: 3 });
                        testClient.socket.close();
                    });

                    let nbConnections = 0;
                    testClient.socket.on(SocketLobby.RECEIVE_LOBBY_INFO, (players: Player[]) => {
                        nbConnections++;
                        if (nbConnections === 3) {
                            testClient.socket.emit(SocketLobby.START_GAME_SERVER);
                        }
                    });

                    testClient.socket.on(SocketLobby.START_GAME_CLIENT, () => {
                        testClient.socket.emit(SocketLobby.LOADING_OVER);
                    });

                    testClient.socket.on(SocketLobby.UPDATE_ROLES, (players: Player[]) => {
                        players.forEach((player) => {
                            if (player.teamNumber === 0) {
                                if (player.isBot) {
                                    expect(player.playerRole).to.equal(PlayerRole.DRAWER);
                                } else {
                                    expect(player.playerRole).to.equal(PlayerRole.GUESSER);
                                }
                            } else {
                                expect(player.playerRole).to.equal(PlayerRole.PASSIVE);
                            }
                        });
                    });

                    return createClient(otherAccountInfo);
                })
                .then((testClient) => {
                    testClient.socket.on('connect', () => {
                        testClient.socket.emit(SocketLobby.GET_ALL_LOBBIES, {}, (lobbies: LobbyInfo[]) => {
                            testClient.socket.emit(SocketLobby.JOIN_LOBBY, lobbies[0].lobbyId, (lobbyInfo: LobbyInfo) => { });
                            clients[0].emit(SocketLobby.ADD_BOT, 1, (success: boolean) => expect(success).to.be.true);
                            clients[0].emit(SocketLobby.ADD_BOT, 0, (success: boolean) => expect(success).to.be.true);
                        });
                    });

                    testClient.socket.on(SocketLobby.START_GAME_CLIENT, () => {
                        testClient.socket.emit(SocketLobby.LOADING_OVER);
                    });

                    testClient.socket.on(SocketDrawing.START_PATH_BC, (id: number, zIndex: number, coord: Coord, brushInfo: BrushInfo) => {
                        expect(id).to.be.equal(0);
                        expect(zIndex).to.be.equal(0);
                        expect(coord).to.deep.equal({ x: 1, y: 1 });
                        expect(brushInfo).to.be.deep.equal({ color: "#000000", strokeWidth: 1 });

                    });

                    testClient.socket.on(SocketDrawing.UPDATE_PATH_BC, (coords: Coord) => {
                        expect(coords).to.deep.equal({ x: 2, y: 2 });
                    });

                    testClient.socket.on(SocketDrawing.END_PATH_BC, (coord: Coord) => {
                        expect(coord).to.deep.equal({ x: 3, y: 3 });
                        testClient.socket.emit(SocketLobby.END_GAME, ReasonEndGame.WINNING_SCORE_REACHED);
                        testClient.socket.close();
                    });
                })
        });
    })

    it('multiple lobbies should work correctly', (done: Mocha.Done) => {
        pictureWordService.uploadDrawing({
            word: 'TestWord2',
            drawnPaths: [{
                id: '0',
                brushInfo: {
                    color: "#000000",
                    strokeWidth: 1
                },
                path: [
                    { x: 1, y: 1 },
                    { x: 2, y: 2 },
                    { x: 3, y: 3 }
                ]
            }],
            hints: ['Clue1', 'Clue2', 'Clue3'],
            difficulty: Difficulty.EASY,
            drawMode: DrawMode.CONVENTIONAL
        }).then(() => {
            testDoneWhenAllClientsAreDisconnected(done);
            createClient(accountInfo)
                .then((testClient) => {
                    testClient.socket.on('connect', () => {
                        testClient.socket.emit(SocketLobby.CREATE_LOBBY, 'lobby1', GameType.SPRINT_COOP, Difficulty.EASY, false,
                            (lobbyInfo: LobbyInfo) => { });
                    });

                    testClient.socket.on(SocketDrawing.START_PATH_BC, (id: number, zIndex: number, coord: Coord, brushInfo: BrushInfo) => {
                        expect(id).to.be.equal(0);
                        expect(zIndex).to.be.equal(0);
                        expect(coord).to.deep.equal({ x: 1, y: 1 });
                    });

                    testClient.socket.on(SocketDrawing.UPDATE_PATH_BC, (coords: Coord) => {
                        expect(coords).to.deep.equal({ x: 2, y: 2 });
                    });

                    testClient.socket.on(SocketDrawing.END_PATH_BC, (coord: Coord) => {
                        expect(coord).to.deep.equal({ x: 3, y: 3 });
                        testClient.socket.close();
                    });


                    testClient.socket.on(SocketLobby.START_GAME_CLIENT, () => {
                        testClient.socket.emit(SocketLobby.LOADING_OVER);
                    });

                    testClient.socket.on(SocketLobby.UPDATE_ROLES, (players: Player[]) => {
                        players.forEach((player) => {
                            if (player.isBot) {
                                expect(player.playerRole).to.equal(PlayerRole.DRAWER);
                            } else {
                                expect(player.playerRole).to.equal(PlayerRole.GUESSER);
                            }
                        })
                    });

                    testClient.socket.on(SocketMessages.PLAYER_CONNECTION, (lobbyId: string) => {
                        testClient.socket.emit(SocketLobby.START_GAME_SERVER);
                    });
                    return createClient(otherAccountInfo);
                })
                .then((testClient) => {
                    testClient.socket.on('connect', () => {
                        testClient.socket.emit(SocketLobby.CREATE_LOBBY, 'lobby2', GameType.SPRINT_SOLO, Difficulty.EASY, false,
                            (lobbyInfo: LobbyInfo) => { });
                    })

                    testClient.socket.on(SocketLobby.RECEIVE_LOBBY_INFO, (lobbyInfo: LobbyInfo) => {
                        testClient.socket.emit(SocketLobby.START_GAME_SERVER);
                    });

                    testClient.socket.on(SocketLobby.START_GAME_CLIENT, () => {
                        testClient.socket.emit(SocketLobby.LOADING_OVER);
                    });

                    testClient.socket.on(SocketDrawing.START_PATH_BC, (id: number, zIndex: number, coord: Coord, brushInfo: BrushInfo) => {
                        expect(id).to.be.equal(0);
                        expect(zIndex).to.be.equal(0);
                        expect(coord).to.deep.equal({ x: 1, y: 1 });
                    })

                    testClient.socket.on(SocketDrawing.UPDATE_PATH_BC, (coords: Coord) => {
                        expect(coords).to.deep.equal({ x: 2, y: 2 });
                    });

                    testClient.socket.on(SocketDrawing.END_PATH_BC, (coord: Coord) => {
                        expect(coord).to.deep.equal({ x: 3, y: 3 });
                        testClient.socket.close();
                    });

                    return createClient(accountInfo3);
                })
                .then((testClient) => {
                    testClient.socket.on('connect', () => {
                        testClient.socket.emit(SocketLobby.GET_ALL_LOBBIES, { gameType: GameType.SPRINT_COOP }, (lobbies: LobbyInfo[]) => {
                            testClient.socket.emit(SocketLobby.JOIN_LOBBY, lobbies[0].lobbyId, (lobbyInfo: LobbyInfo) => { });
                        });
                    });

                    testClient.socket.on(SocketLobby.START_GAME_CLIENT, () => {
                        testClient.socket.emit(SocketLobby.LOADING_OVER);
                    });

                    testClient.socket.on(SocketDrawing.START_PATH_BC, (id: number, zIndex: number, coord: Coord, brushInfo: BrushInfo) => {
                        expect(id).to.be.equal(0);
                        expect(zIndex).to.be.equal(0);
                        expect(coord).to.deep.equal({ x: 1, y: 1 });
                    })

                    testClient.socket.on(SocketDrawing.UPDATE_PATH_BC, (coords: Coord) => {
                        expect(coords).to.deep.equal({ x: 2, y: 2 });
                    });

                    testClient.socket.on(SocketDrawing.END_PATH_BC, (coord: Coord) => {
                        expect(coord).to.deep.equal({ x: 3, y: 3 });
                        testClient.socket.close();
                    });
                });
        })
    });

    it('friendship notifications should work correctly', (done: Mocha.Done) => {
        testDoneWhenAllClientsAreDisconnected(done);
        let accountId2: string;
        createClient(accountInfo)
            .then((testClient) => {

                let friendList1: FriendsList;

                testClient.socket.on(SocketFriendActions.UPDATE, (friendList: FriendsList) => {
                    friendList1 = friendList;
                });

                testClient.socket.on(SocketFriendListNotifications.NOTIFICATION_RECEIVED, (notif: NotificationType, accountId: string) => {
                    if (notif === NotificationType.requestReceived) {
                        expect(friendList1.friends[0].status).to.equal(FriendStatus.PENDING);
                        expect(friendList1.friends[0].received).to.be.true;
                        friendService.acceptFriendship(testClient.accountId, accountId2)
                            .then((friendList) => {
                                expect(friendList.documents.friends[0].status).to.equal(FriendStatus.FRIEND);
                                expect(friendList.documents.friends[0].received).to.be.true;
                                testClient.socket.close();
                            });
                    }
                });
                return createClient(otherAccountInfo);
            })
            .then((testClient) => {
                accountId2 = testClient.accountId;

                let friendList2: FriendsList;


                testClient.socket.on('connect', () => {
                    friendService.requestFriendship(accountId2, 'username');
                })

                testClient.socket.on(SocketFriendActions.UPDATE, (friendList: FriendsList) => {
                    friendList2 = friendList;
                });

                testClient.socket.on(SocketFriendListNotifications.NOTIFICATION_RECEIVED, (notif: NotificationType, accountId: string) => {
                    if (notif === NotificationType.requestAccepted) {
                        expect(friendList2.friends[0].status).to.equal(FriendStatus.FRIEND);
                        expect(friendList2.friends[0].received).to.be.false;
                        testClient.socket.close();
                    }
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

                testClient.socket.on(SocketFriendListNotifications.NOTIFICATION_RECEIVED, (notif: NotificationType, accountId: string) => {
                    if (notif === NotificationType.requestReceived) {
                        friendService.acceptFriendship(testClient.accountId, accountId2);
                    }
                });

                testClient.socket.on(SocketMessages.RECEIVE_PRIVATE_MESSAGE, (msg: PrivateMessage) => {
                    if (msg.senderAccountId != accountId) {
                        expect(msg.content).to.equal('bonjourhi');
                        expect(msg.senderAccountId).to.equal(accountId2);
                        const otherMsg: PrivateMessageTo = {
                            receiverAccountId: accountId2,
                            content: 'eyo what up',
                        }
                        testClient.socket.emit(SocketMessages.SEND_PRIVATE_MESSAGE, otherMsg);
                    }
                })
                return createClient(otherAccountInfo);
            })
            .then((testClient) => {
                accountId2 = testClient.accountId;

                testClient.socket.on('connect', () => {
                    friendService.requestFriendship(accountId2, 'username');
                });

                testClient.socket.on(SocketMessages.RECEIVE_PRIVATE_MESSAGE, (msg: PrivateMessage) => {
                    if (msg.senderAccountId != accountId2) {
                        expect(msg.content).to.equal('eyo what up');
                        expect(msg.senderAccountId).to.equal(accountId);
                        friendService.getMessageHistory(accountId, accountId2, 1, 5)
                            .then((history) => {
                                expect(history.statusCode).to.equal(OK);
                                expect(history.documents.messages).to.be.lengthOf(2);
                                clients[0].close();
                                clients[1].close();
                            })
                    }
                });

                testClient.socket.on(SocketFriendListNotifications.NOTIFICATION_RECEIVED, (notif: NotificationType, accountId: string) => {
                    if (notif === NotificationType.requestAccepted) {
                        const msg: PrivateMessageTo = {
                            receiverAccountId: accountId,
                            content: 'bonjourhi',
                        }
                        testClient.socket.emit(SocketMessages.SEND_PRIVATE_MESSAGE, msg);
                    }
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

                testClient.socket.on(SocketFriendListNotifications.NOTIFICATION_RECEIVED, (notif: NotificationType, accountId: string) => {
                    if (notif === NotificationType.requestReceived) {
                        friendService.acceptFriendship(testClient.accountId, accountId2);
                    }
                });

                testClient.socket.on(SocketMessages.RECEIVE_PRIVATE_MESSAGE, (msg: PrivateMessage) => {
                    expect(msg.content).to.equal('bonjourhi');
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

                testClient.socket.on(SocketFriendActions.UPDATE, (friendList: FriendsList) => {
                    friendService.getMessageHistory(accountId, accountId2, 1, 5)
                        .catch((err) => {
                            expect(err.statusCode).to.equal(NOT_FOUND);
                            testClient.socket.close();
                        })
                });

                testClient.socket.on(SocketFriendListNotifications.NOTIFICATION_RECEIVED, (notif: NotificationType, accountId: string) => {
                    if (notif === NotificationType.requestAccepted) {
                        const msg: PrivateMessageTo = {
                            receiverAccountId: accountId,
                            content: 'bonjourhi',
                        }
                        testClient.socket.emit(SocketMessages.SEND_PRIVATE_MESSAGE, msg);
                    }
                });
            });
    });

    it('private message history should be deleted when deleting account', (done: Mocha.Done) => {
        let accountId1: string;
        let accountId2: string;
        let accountId3: string;
        testDoneWhenAllClientsAreDisconnected(done);
        createClient(accountInfo)
            .then((testClient) => {
                accountId1 = testClient.accountId;

                testClient.socket.on(SocketFriendListNotifications.NOTIFICATION_RECEIVED, (notif: NotificationType, accountId: string) => {
                    if (notif === NotificationType.requestReceived) {
                        friendService.acceptFriendship(testClient.accountId, accountId3);
                    }
                });

                testClient.socket.on(SocketMessages.RECEIVE_PRIVATE_MESSAGE, (msg: PrivateMessage) => {
                    testClient.socket.close();
                })
                return createClient(otherAccountInfo);
            })
            .then((testClient) => {
                accountId2 = testClient.accountId;

                testClient.socket.on(SocketFriendListNotifications.NOTIFICATION_RECEIVED, (notif: NotificationType, accountId: string) => {
                    if (notif === NotificationType.requestReceived) {
                        friendService.acceptFriendship(testClient.accountId, accountId3);
                    }
                });

                testClient.socket.on(SocketMessages.RECEIVE_PRIVATE_MESSAGE, (msg: PrivateMessage) => {
                    const otherMsg: PrivateMessageTo = {
                        receiverAccountId: accountId3,
                        content: 'eyo what up',
                    }
                    testClient.socket.emit(SocketMessages.SEND_PRIVATE_MESSAGE, otherMsg);
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
                testClient.socket.on(SocketFriendListNotifications.NOTIFICATION_RECEIVED, (notif: NotificationType, accountId: string) => {
                    if (notif === NotificationType.requestAccepted) {
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
                            testClient.socket.emit(SocketMessages.SEND_PRIVATE_MESSAGE, msg(accountId1))
                            testClient.socket.emit(SocketMessages.SEND_PRIVATE_MESSAGE, msg(accountId2));
                        }
                    }
                });

                testClient.socket.on(SocketMessages.RECEIVE_PRIVATE_MESSAGE, (msg: PrivateMessage) => {
                    if (msg.senderAccountId != accountId3) {
                        clients[1].close();
                        expect(msg.senderAccountId).to.be.equal(accountId2);

                        friendService.getMessageHistory(accountId3, accountId2, 1, 5)
                            .then((history) => {
                                expect(history.documents.messages).to.be.lengthOf(2);
                                return friendService.getMessageHistory(accountId1, accountId3, 1, 5);
                            })
                            .then((history) => {
                                expect(history.documents.messages).to.be.lengthOf(1);
                                return databaseService.deleteAccount(accountId3);
                            })
                            .then((result) => {
                                return friendService.getMessageHistory(accountId3, accountId2, 1, 5)
                            })
                            .catch((err: ErrorMsg) => {
                                expect(err.statusCode).to.be.equal(NOT_FOUND);
                                return friendService.getMessageHistory(accountId3, accountId1, 1, 5)
                            })
                            .catch((err: ErrorMsg) => {
                                expect(err.statusCode).to.be.equal(NOT_FOUND);
                                testClient.socket.close();
                            });
                    }
                });
            });
    });
});