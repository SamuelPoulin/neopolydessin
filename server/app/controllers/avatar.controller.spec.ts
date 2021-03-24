import chai from 'chai';
import { describe, beforeEach } from 'mocha';
import 'chai-http';
chai.use(require('chai-http'));
import sinon from 'sinon';
import express from 'express';
import { testingContainer } from '../../test/test-utils';
import { Application } from '../app';
import Types from '../types';
import { AvatarController, AVATAR_PATH } from './avatar.controller';
import { DatabaseService } from '../services/database.service';
import * as jwtVerify from '../middlewares/jwt-verify';
import { AvatarService } from '../services/avatar.service';
import { NOT_FOUND, OK } from 'http-status-codes';
import fs from 'fs';

describe('AvatarController', () => {
    let avatarController: AvatarController;
    let application: Application;
    let jwtVerifyStub: any;
    let checkLoggedInStub: any;
    let uploadAvatarStub: any;
    let getAvatarStub: any;

    before(() => {
        jwtVerifyStub = sinon.stub(jwtVerify, 'jwtVerify');
        jwtVerifyStub.callsFake(
            (req: express.Request, res: express.Response, next: express.NextFunction) => {
                req.params._id = '1';
                return next();
            });
    })

    beforeEach((done: Mocha.Done) => {
        testingContainer().then((instance) => {
            checkLoggedInStub = instance[1].stub(DatabaseService.prototype, 'checkIfLoggedIn')
            checkLoggedInStub.resolves(true);

            uploadAvatarStub = instance[1].stub(AvatarService.prototype, 'upload');
            getAvatarStub = instance[1].stub(AvatarService.prototype, 'getAvatar');
            application = instance[0].get<Application>(Types.Application);
            avatarController = instance[0].get<AvatarController>(Types.AvatarController);
            done();
        });
    });

    after(() => {
        jwtVerifyStub.restore();
    });

    afterEach(async () => {
        uploadAvatarStub.restore();
        getAvatarStub.restore();
        if (fs.existsSync(`${AVATAR_PATH}/1.png`)) {
            console.log('exists');
            fs.unlinkSync(`${AVATAR_PATH}/1.png`);
        }
    });

    it('should instanciate correctly', () => {
        chai.expect(avatarController).to.be.instanceOf(AvatarController);
    });

    it('should call upload when POST /api/avatar/upload is used', (done: Mocha.Done) => {
        uploadAvatarStub.resolves({ statusCode: OK, documents: { id: 'someId' } })
        chai
            .request(application.app)
            .post('/api/avatar/upload')
            .set('content-type', 'multipart/form-data')
            .attach('file', 'test/icon.png', 'icon.png')
            .then(() => {
                chai.expect(uploadAvatarStub.called).to.equal(true);
                done();
            });
    });

    it('get with id should return picture correctly', (done: Mocha.Done) => {
        uploadAvatarStub.resolves({ statusCode: OK, documents: { id: 'someId' } })
        getAvatarStub.resolves({ statusCode: OK, documents: `${AVATAR_PATH}/1.png` })

        chai
            .request(application.app)
            .post('/api/avatar/upload')
            .set('content-type', 'multipart/form-data')
            .attach('file', 'test/icon.png', 'icon.png')
            .then(() => {
                chai.expect(uploadAvatarStub.called).to.equal(true);
                chai.request(application.app)
                    .get('/api/avatar/1')
                    .end((err, res) => {
                        chai.expect(getAvatarStub.called).to.equal(true);
                        chai.expect(res.status).to.be.equal(OK);
                        done();
                    });
            });


    });

    it('get with id should return 404 if avatar with given id doesn\'t exist', (done: Mocha.Done) => {
        getAvatarStub.rejects({ statusCode: NOT_FOUND, message: 'not found' });
        chai
            .request(application.app)
            .get('/api/avatar/1')
            .end((err, res) => {
                chai.expect(getAvatarStub.called).to.equal(true);
                chai.expect(res.status).to.be.equal(NOT_FOUND);
                done();
            });
    });
});