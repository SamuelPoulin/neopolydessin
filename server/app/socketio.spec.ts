import { expect } from 'chai';
import { describe, beforeEach } from 'mocha';
import { testingContainer } from '../test/test-utils';
import { SocketIo } from './socketio';
import { Server } from './server';
import { Manager, Socket } from 'socket.io-client'
import Types from './types';
import { DatabaseService, LoginTokens, Response, } from './services/database.service';
import { Account } from '../models/account';
import { TEST_PORT } from './constants';
import { accountInfo } from './services/database.service.spec';
import { SocketConnection } from '../../common/socketendpoints/socket-connection';
import * as jwtUtils from './utils/jwt-util';
import { Login } from '../models/logins';

describe('Socketio', () => {

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
});