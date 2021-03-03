import Types from '../types';
import * as sinon from 'sinon';
import * as chai from 'chai';
import 'chai-http';
import { describe } from 'mocha';
chai.use(require('chai-http'));
import { testingContainer } from '../../test/test-utils';
import * as jwtVerify from '../middlewares/jwt-verify';
import { DatabaseService, Response } from '../services/database.service';
import { FriendsController } from './friends.controller';
import { FriendsService } from '../services/friends.service';
import { BAD_REQUEST, NOT_FOUND, OK } from 'http-status-codes';
import { FriendsList, FriendStatus } from '../../models/account';
import { Application } from '../app';
import { expect } from 'chai';
import * as express from 'express';
import { Decision } from '../../../common/communication/friend-request';

describe('friends controller', () => {

    let friendsController: FriendsController;
    let jwtVerifyStub: any;
    let checkLoggedInStub: any;
    let application: Application;

    const friendList: Response<FriendsList> = {
        statusCode: OK,
        documents: {
            friends: [
                {
                    friendId: '123456789012345678901234',
                    username: 'itsYaBoi',
                    status: FriendStatus.FRIEND,
                    received: true
                }
            ]
        }
    }

    before(() => {
        // bypass custom middlewares
        jwtVerifyStub = sinon.stub(jwtVerify, 'jwtVerify');
        jwtVerifyStub.callsFake(
            (req: express.Request, res: express.Response, next: express.NextFunction) => {
                req.params._id = '1';
                return next();
            });
    });

    after(() => {
        jwtVerifyStub.restore();
    })

    beforeEach(async () => {
        await testingContainer().then((instance) => {
            checkLoggedInStub = instance[1].stub(DatabaseService.prototype, 'checkIfLoggedIn')
            checkLoggedInStub.resolves(true);
            application = instance[0].get<Application>(Types.Application);
            friendsController = instance[0].get<FriendsController>(Types.FriendsController);
        });
    });

    it('should instanciate correctly', (done: Mocha.Done) => {
        chai.expect(friendsController).to.be.instanceOf(FriendsController);
        done();
    });

    it('should call getFriendsOfUser and resolve promise when accessing api/database/friends', (done: Mocha.Done) => {
        const stub = sinon.stub(FriendsService.prototype, 'getFriendsOfUser').resolves(friendList);
        chai
            .request(application.app)
            .get('/api/database/friends')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(OK);
                expect(res.body).to.deep.equal(friendList.documents);
                expect(stub.called).to.equal(true);
                stub.restore();
                done();
            });
    });

    it('should call getFriendsOfUser and reject promise when accessing api/database/friends', (done: Mocha.Done) => {
        const stub = sinon.stub(FriendsService.prototype, 'getFriendsOfUser')
            .rejects({ statusCode: NOT_FOUND, message: 'Not found' });
        chai
            .request(application.app)
            .get('/api/database/friends')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(NOT_FOUND);
                expect(stub.called).to.equal(true);
                stub.restore();
                done();
            });
    });

    it('should call requestFriendship and resolve promise when POST on api/database/friends', (done: Mocha.Done) => {
        const stub = sinon.stub(FriendsService.prototype, 'requestFriendship').resolves(friendList);
        chai
            .request(application.app)
            .post('/api/database/friends')
            .set('content-type', 'application/json')
            .send({
                email: 'email@email.email'
            })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(OK);
                expect(stub.called).to.equal(true);
                stub.restore();
                done();
            });
    });

    it('should call requestFriendship and reject promise when POST on api/database/friends', (done: Mocha.Done) => {
        const stub = sinon.stub(FriendsService.prototype, 'requestFriendship')
            .rejects({ statusCode: NOT_FOUND, message: 'Not found' });
        chai
            .request(application.app)
            .post('/api/database/friends')
            .set('content-type', 'application/json')
            .send({
                email: 'email@email.email'
            })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(NOT_FOUND);
                expect(stub.called).to.equal(true);
                stub.restore();
                done();
            });
    });

    it('should return BAD_REQUEST if email is not supplied when POST on api/database/friends', (done: Mocha.Done) => {
        const stub = sinon.stub(FriendsService.prototype, 'requestFriendship').resolves(friendList);
        chai
            .request(application.app)
            .post('/api/database/friends')
            .set('content-type', 'application/json')
            .send({
                email: 'emailemail.email'
            })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(BAD_REQUEST);
                expect(stub.called).to.equal(false);
                stub.restore();
                done();
            });
    });

    it('should call acceptFriendship if decision is accept and resolve promise when POST on api/database/friends/decision', (done: Mocha.Done) => {
        const stub = sinon.stub(FriendsService.prototype, 'acceptFriendship').resolves(friendList);
        chai
            .request(application.app)
            .post('/api/database/friends/decision')
            .set('content-type', 'application/json')
            .send({
                idOfFriend: '1',
                decision: Decision.ACCEPT
            })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(OK);
                expect(stub.called).to.equal(true);
                stub.restore();
                done();
            });
    });

    it('should call acceptFriendship if decision is accept and reject promise when POST on api/database/friends/decision', (done: Mocha.Done) => {
        const stub = sinon.stub(FriendsService.prototype, 'acceptFriendship')
            .rejects({ statusCode: NOT_FOUND, message: 'Not found' });
        chai
            .request(application.app)
            .post('/api/database/friends/decision')
            .set('content-type', 'application/json')
            .send({
                idOfFriend: '1',
                decision: Decision.ACCEPT
            })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(NOT_FOUND);
                expect(stub.called).to.equal(true);
                stub.restore();
                done();
            });
    });

    it('should call refuseFriendship if decision is refuse when POST on api/database/friends/decision', (done: Mocha.Done) => {
        const stub = sinon.stub(FriendsService.prototype, 'refuseFriendship').resolves(friendList);
        chai
            .request(application.app)
            .post('/api/database/friends/decision')
            .set('content-type', 'application/json')
            .send({
                idOfFriend: '1',
                decision: Decision.REFUSE
            })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(OK);
                expect(stub.called).to.be.true;
                stub.restore();
                done();
            });
    });

    it('should call refuseFriendship if decision is refuse and reject promise when POST on api/database/friends/decision', (done: Mocha.Done) => {
        const stub = sinon.stub(FriendsService.prototype, 'refuseFriendship')
            .rejects({ statusCode: NOT_FOUND, message: 'Not found' });
        chai
            .request(application.app)
            .post('/api/database/friends/decision')
            .set('content-type', 'application/json')
            .send({
                idOfFriend: '1',
                decision: Decision.REFUSE
            })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(NOT_FOUND);
                expect(stub.called).to.equal(true);
                stub.restore();
                done();
            });
    });

    it('should return BAD_REQUEST if body is malformed when POST on api/database/friends/decision', (done: Mocha.Done) => {
        chai
            .request(application.app)
            .post('/api/database/friends/decision')
            .set('content-type', 'application/json')
            .send({
                idOfFriend: '1',
                decision: 'something invalid'
            })
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(BAD_REQUEST);
                done();
            });
    });

    it('should call unfriend when DELETE on api/database/:id', (done: Mocha.Done) => {
        const stub = sinon.stub(FriendsService.prototype, 'unfriend').resolves(friendList);
        chai
            .request(application.app)
            .delete('/api/database/friends/1')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(OK);
                expect(stub.called).to.be.true;
                stub.restore();
                done();
            });
    });

    it('should call unfriend and send NOT ok when promise rejects', (done: Mocha.Done) => {
        const stub = sinon.stub(FriendsService.prototype, 'unfriend')
            .rejects({ statusCode: NOT_FOUND, message: 'Not found' })
        chai
            .request(application.app)
            .delete('/api/database/friends/1')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(NOT_FOUND);
                expect(stub.called).to.be.true;
                stub.restore();
                done();
            });
    })
})
