import { expect } from 'chai';
import { describe, beforeEach } from 'mocha';
import { testingContainer } from '../test/test-utils';
import { SocketIo } from './socketio';
import { Server } from './server';
import { Manager, Socket } from 'socket.io-client'
import Types from './types';
import { DatabaseService, LoginTokens, Response } from './services/database.service';
import { SinonStub } from 'sinon';
import { TEST_PORT } from './constants';
import { accountInfo } from './services/database.service.spec';

describe.only('Socketio', () => {

    let addLoginStub: SinonStub;
    let addLogoutStub: SinonStub;

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
            addLoginStub = instance[1].stub(DatabaseService.prototype, 'addLogin');
            addLogoutStub = instance[1].stub(DatabaseService.prototype, 'addLogout');
            databaseService = instance[0].get<DatabaseService>(Types.DatabaseService);
            server = instance[0].get<Server>(Types.Server);
            socketIo = instance[0].get<SocketIo>(Types.Socketio);

            server.init(TEST_PORT);

            manager = new Manager(`http://localhost:${TEST_PORT}`, {
                reconnectionDelayMax: 10000,
                transports: ['websocket'],
            });

        });

        await databaseService.connectMS();

    });

    afterEach(async () => {
        if (client) {
            client.close();
        }
        if (server && server.isListening) {
            server.close();
        }
        await databaseService.disconnectDB();
    })

    it('should instantiate correctly', (done: Mocha.Done) => {
        expect(socketIo).to.be.instanceOf(SocketIo);
        done();
    });

    it('client socket connection should call addLogin and disconnection should call addLogout', (done: Mocha.Done) => {
        databaseService.createAccount(accountInfo)
            .then((tokens: Response<LoginTokens>) => {
                client = manager.socket('/', {
                    auth: {
                        token: tokens.documents.accessToken,
                    }
                });
                client.disconnect();
                setTimeout(() => {
                    expect(addLoginStub.calledOnce).to.be.true;
                    expect(addLogoutStub.calledOnce).to.be.true;
                    done();
                })
            })
    })
});