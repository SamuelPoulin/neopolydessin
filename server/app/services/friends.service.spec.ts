import { expect } from 'chai';
import { BAD_REQUEST, NOT_FOUND, OK } from 'http-status-codes';
import { describe } from 'mocha';
import jwt from 'jsonwebtoken';
import { testingContainer } from '../../test/test-utils';
import Types from '../types';
import { DatabaseService, ErrorMsg, Response } from './database.service';
import { connectMS, disconnectMS } from './database.service.spec';
import { accountInfo } from './database.service.spec';
import { FriendsService } from './friends.service';
import { Account } from '../../models/schemas/account';
import { Register } from '../../../common/communication/register';
import { SocketIo } from '../socketio';
import { AccessToken } from '../utils/jwt-util';
import MongoMemoryServer from 'mongodb-memory-server-core';
import { LoginResponse } from '../../../common/communication/login';
import { FriendsList, FriendStatus } from '../../../common/communication/friends';

export const otherAccountInfo: Register = {
    firstName: 'name',
    lastName: 'lname',
    username: 'username1',
    email: 'email1@email.email',
    password: 'monkey123',
    passwordConfirm: 'monkey123'
}

describe('Friends Service', () => {

    let mongoMs: MongoMemoryServer;
    let databaseService: DatabaseService;
    let friendsService: FriendsService;

    const env = Object.assign({}, process.env);
    let secret_key: string;
    let sendFriendListToStub: sinon.SinonStub<any[], any>;

    before(() => {
        process.env.JWT_KEY = 'this is a super secret secret!!!';
        process.env.JWT_REFRESH_KEY = 'this is another super secret secret!!!';
        secret_key = process.env.JWT_KEY ? process.env.JWT_KEY : 'wrong key';
    });

    after(() => {
        process.env = env;
    });


    beforeEach(async () => {
        await testingContainer().then((instance) => {
            sendFriendListToStub = instance[1].stub(SocketIo.prototype, 'sendFriendListTo');
            friendsService = instance[0].get<FriendsService>(Types.FriendsService);
            databaseService = instance[0].get<DatabaseService>(Types.DatabaseService);
        });

        mongoMs = await connectMS();
    });

    afterEach(async () => {
        await disconnectMS(mongoMs);
    });

    it('should instanciate correctly', (done: Mocha.Done) => {
        expect(friendsService).to.be.instanceOf(FriendsService);
        done();
    });

    it('getFriendsOfUser should resolve to NOT_FOUND if user doesn\'t exist', (done: Mocha.Done) => {
        friendsService.getFriendsOfUser('123456789012345678901234')
            .catch((error: ErrorMsg) => {
                expect(error.statusCode).to.be.equal(NOT_FOUND);
                done();
            })
    })

    it('getFriendsOfUser should resolve to OK if user exists and has no friends', (done: Mocha.Done) => {
        databaseService.createAccount(accountInfo)
            .then((tokens: Response<LoginResponse>) => {
                const secret_key = process.env.JWT_KEY ? process.env.JWT_KEY : 'wrong key';
                const decodedJwt = jwt.verify(tokens.documents.accessToken, secret_key) as AccessToken;
                return friendsService.getFriendsOfUser(decodedJwt._id)
            })
            .then((friendList: Response<FriendsList>) => {
                expect(friendList.statusCode).to.equal(OK);
                expect(friendList.documents.friends).to.deep.equal([]);
                done();
            })
    });

    it('getFriendsOfUser should return a friend list with null values if friends account has been deleted', (done: Mocha.Done) => {
        let myId: string;
        let otherId: string;
        databaseService.createAccount(accountInfo)
            .then((tokens: Response<LoginResponse>) => {
                const decodedJwt = jwt.verify(tokens.documents.accessToken, secret_key) as AccessToken;
                myId = decodedJwt._id;
                return databaseService.createAccount(otherAccountInfo);
            })
            .then((tokens: Response<LoginResponse>) => {
                const decodedJwt = jwt.verify(tokens.documents.accessToken, secret_key) as AccessToken;
                otherId = decodedJwt._id;
                return friendsService.requestFriendship(myId, 'username1');
            })
            .then((friendList: Response<FriendsList>) => {
                return friendsService.acceptFriendship(otherId, myId);
            })
            .then((friendList: Response<FriendsList>) => {
                return databaseService.deleteAccount(otherId);
            })
            .then((account: Response<Account>) => {
                return friendsService.getFriendsOfUser(myId);
            })
            .then((friendList: Response<FriendsList>) => {
                expect(friendList.statusCode).to.equal(OK);
                expect(friendList.documents.friends).to.deep.equal(
                    [
                        {
                            friendId: null,
                            status: FriendStatus.FRIEND,
                            received: false,
                            isOnline: false,
                        }
                    ]
                )
                done();
            })

    });

    it('requestFriendship should resolve to BAD_REQUEST if trying to friend yourself', (done: Mocha.Done) => {
        let myId: string;
        databaseService.createAccount(accountInfo)
            .then((tokens: Response<LoginResponse>) => {
                const decodedJwt = jwt.verify(tokens.documents.accessToken, secret_key) as AccessToken;
                myId = decodedJwt._id;
                return friendsService.requestFriendship(myId, 'username1');
            })
            .catch((err: ErrorMsg) => {
                expect(err.statusCode).to.equal(BAD_REQUEST);
                done();
            })
    });

    it('requestFriendship should resolve to BAD_REQUEST if trying to friend a friend', (done: Mocha.Done) => {
        let myId: string;
        let otherId: string;
        databaseService.createAccount(accountInfo)
            .then((tokens: Response<LoginResponse>) => {
                const decodedJwt = jwt.verify(tokens.documents.accessToken, secret_key) as AccessToken;
                myId = decodedJwt._id;
                return databaseService.createAccount(otherAccountInfo);
            })
            .then((tokens: Response<LoginResponse>) => {
                const decodedJwt = jwt.verify(tokens.documents.accessToken, secret_key) as AccessToken;
                otherId = decodedJwt._id;
                return friendsService.requestFriendship(myId, 'username1');
            })
            .then((friendList: Response<FriendsList>) => {
                return friendsService.acceptFriendship(otherId, myId);
            })
            .then((friendList: Response<FriendsList>) => {
                return friendsService.requestFriendship(myId, 'username1');
            })
            .catch((err: ErrorMsg) => {
                expect(err.statusCode).to.equal(BAD_REQUEST);
                done();
            })
    });

    it('acceptFriendship should resolve to OK and return updated friendslist', (done: Mocha.Done) => {
        let myId: string;
        let otherId: string;
        databaseService.createAccount(accountInfo)
            .then((tokens: Response<LoginResponse>) => {
                const decodedJwt = jwt.verify(tokens.documents.accessToken, secret_key) as AccessToken;
                myId = decodedJwt._id;
                return databaseService.createAccount(otherAccountInfo);
            })
            .then((tokens: Response<LoginResponse>) => {
                const decodedJwt = jwt.verify(tokens.documents.accessToken, secret_key) as AccessToken;
                otherId = decodedJwt._id;
                return friendsService.requestFriendship(myId, 'username1');
            })
            .then((friendList: Response<FriendsList>) => {
                expect(friendList.statusCode).to.equal(OK);
                expect(friendList.documents.friends[0].status).to.equal(FriendStatus.PENDING);
                expect(sendFriendListToStub.calledOnce).to.be.true;
                return friendsService.acceptFriendship(otherId, myId);
            })
            .then((friendList: Response<FriendsList>) => {
                expect(friendList.statusCode).to.equal(OK);
                expect(friendList.documents.friends[0].status).to.equal(FriendStatus.FRIEND);
                expect(sendFriendListToStub.calledTwice).to.be.true;
                return friendsService.getFriendsOfUser(myId);
            })
            .then((friendList: Response<FriendsList>) => {
                expect(friendList.statusCode).to.equal(OK);
                expect(friendList.documents.friends[0].status).to.equal(FriendStatus.FRIEND);
                expect(sendFriendListToStub.calledTwice).to.be.true;
                done();
            })
    });

    it('acceptFriendship should resolve to BAD_REQUEST if trying to accept a request you sent', (done: Mocha.Done) => {
        let myId: string;
        let otherId: string;
        databaseService.createAccount(accountInfo)
            .then((tokens: Response<LoginResponse>) => {
                const decodedJwt = jwt.verify(tokens.documents.accessToken, secret_key) as AccessToken;
                myId = decodedJwt._id;
                return databaseService.createAccount(otherAccountInfo);
            })
            .then((tokens: Response<LoginResponse>) => {
                const decodedJwt = jwt.verify(tokens.documents.accessToken, secret_key) as AccessToken;
                otherId = decodedJwt._id;
                return friendsService.requestFriendship(myId, 'username1');
            })
            .then((friendList: Response<FriendsList>) => {
                return friendsService.acceptFriendship(myId, otherId);
            })
            .catch((err: ErrorMsg) => {
                expect(err.statusCode).to.equal(BAD_REQUEST);
                done();
            })

    });

    it('refuseFriendship should resolve to OK and return updated friend list', (done: Mocha.Done) => {
        let myId: string;
        let otherId: string;
        databaseService.createAccount(accountInfo)
            .then((tokens: Response<LoginResponse>) => {
                const decodedJwt = jwt.verify(tokens.documents.accessToken, secret_key) as AccessToken;
                myId = decodedJwt._id;
                return databaseService.createAccount(otherAccountInfo);
            })
            .then((tokens: Response<LoginResponse>) => {
                const decodedJwt = jwt.verify(tokens.documents.accessToken, secret_key) as AccessToken;
                otherId = decodedJwt._id;
                return friendsService.requestFriendship(myId, 'username1');
            })
            .then((friendList: Response<FriendsList>) => {
                expect(friendList.statusCode).to.equal(OK);
                expect(friendList.documents.friends[0].received).to.be.false;
                expect(friendList.documents.friends[0].friendId).to.not.be.null;
                expect(sendFriendListToStub.calledOnce).to.be.true;
                return friendsService.getFriendsOfUser(otherId);
            })
            .then((friendList: Response<FriendsList>) => {
                expect(friendList.statusCode).to.equal(OK);
                expect(friendList.documents.friends[0].received).to.be.true;
                expect(friendList.documents.friends[0].friendId).to.not.be.null;
                expect(sendFriendListToStub.calledOnce).to.be.true;
                return friendsService.refuseFriendship(otherId, myId);
            })
            .then((friendList: Response<FriendsList>) => {
                expect(friendList.statusCode).to.equal(OK);
                expect(friendList.documents.friends).to.deep.equal([])
                expect(sendFriendListToStub.called).to.be.true;
                return friendsService.getFriendsOfUser(myId);
            })
            .then((friendList: Response<FriendsList>) => {
                expect(friendList.statusCode).to.equal(OK);
                expect(friendList.documents.friends).to.deep.equal([]);
                expect(sendFriendListToStub.calledTwice).to.be.true;
                done();
            })
    });

    it('refuseFriendship should resolve to BAD_REQUEST if trying to refuse a request you sent', (done: Mocha.Done) => {
        let myId: string;
        let otherId: string;
        databaseService.createAccount(accountInfo)
            .then((tokens: Response<LoginResponse>) => {
                const decodedJwt = jwt.verify(tokens.documents.accessToken, secret_key) as AccessToken;
                myId = decodedJwt._id;
                return databaseService.createAccount(otherAccountInfo);
            })
            .then((tokens: Response<LoginResponse>) => {
                const decodedJwt = jwt.verify(tokens.documents.accessToken, secret_key) as AccessToken;
                otherId = decodedJwt._id;
                return friendsService.requestFriendship(myId, 'username1');
            })
            .then((friendList: Response<FriendsList>) => {
                return friendsService.refuseFriendship(myId, otherId);
            })
            .catch((err: ErrorMsg) => {
                expect(err.statusCode).to.equal(BAD_REQUEST);
                done();
            });
    });

    it('unfriend should resolve to OK and return updated list', (done: Mocha.Done) => {
        let myId: string;
        let otherId: string;
        databaseService.createAccount(accountInfo)
            .then((tokens: Response<LoginResponse>) => {
                const decodedJwt = jwt.verify(tokens.documents.accessToken, secret_key) as AccessToken;
                myId = decodedJwt._id;
                return databaseService.createAccount(otherAccountInfo);
            })
            .then((tokens: Response<LoginResponse>) => {
                const decodedJwt = jwt.verify(tokens.documents.accessToken, secret_key) as AccessToken;
                otherId = decodedJwt._id;
                return friendsService.requestFriendship(myId, 'username1');
            })
            .then((friendList: Response<FriendsList>) => {
                return friendsService.acceptFriendship(otherId, myId);
            })
            .then((friendList: Response<FriendsList>) => {
                return friendsService.unfriend(myId, otherId);
            })
            .then((friendList: Response<FriendsList>) => {
                expect(friendList.statusCode).to.equal(OK);
                expect(friendList.documents.friends).to.deep.equal([]);
                return friendsService.getFriendsOfUser(otherId);
            })
            .then((friendList: Response<FriendsList>) => {
                expect(friendList.statusCode).to.equal(OK);
                expect(friendList.documents.friends).to.deep.equal([]);
                done();
            })
    });

    it('unfriend should resolve to NOT_FOUND if friend isn\'t there', (done: Mocha.Done) => {
        let myId: string;
        databaseService.createAccount(accountInfo)
            .then((tokens: Response<LoginResponse>) => {
                const decodedJwt = jwt.verify(tokens.documents.accessToken, secret_key) as AccessToken;
                myId = decodedJwt._id;
                return friendsService.unfriend(myId, '123456789012345678901234');
            })
            .catch((err: ErrorMsg) => {
                expect(err.statusCode).to.equal(NOT_FOUND);
                done();
            })
    });

});
