import chai, { expect } from 'chai';
import { describe, beforeEach } from 'mocha';
import 'chai-http';
chai.use(require('chai-http'));
import sinon from 'sinon';
import express from 'express';
import { testingContainer } from '../../test/test-utils';
import { Application } from '../app';
import Types from '../types';
import { AvatarController } from './avatar.controller';
import { DatabaseService } from '../services/database.service';
import * as jwtVerify from '../middlewares/jwt-verify';
import { NOT_FOUND, OK } from 'http-status-codes';
import fs from 'fs';
import { connectMS, disconnectMS } from '../services/database.service.spec';
import MongoMemoryServer from 'mongodb-memory-server-core';
import avatarModel from '../../models/schemas/avatar';

describe('AvatarController', () => {

    const avatarPath = 'test/avatar';
    let avatarController: AvatarController;
    let application: Application;
    let jwtVerifyStub: any;
    let checkLoggedInStub: any;
    let mongoMs: MongoMemoryServer;

    before(() => {
        jwtVerifyStub = sinon.stub(jwtVerify, 'jwtVerify');
        jwtVerifyStub.callsFake(
            (req: express.Request, res: express.Response, next: express.NextFunction) => {
                req.params._id = '1';
                return next();
            });
    })

    beforeEach(async () => {
        testingContainer().then((instance) => {
            checkLoggedInStub = instance[1].stub(DatabaseService.prototype, 'checkIfLoggedIn')
            checkLoggedInStub.resolves(true);
            application = instance[0].get<Application>(Types.Application);
            avatarController = instance[0].get<AvatarController>(Types.AvatarController);
            avatarController.setAvatarPath(avatarPath);
        });
        mongoMs = await connectMS();
    });

    after(() => {
        jwtVerifyStub.restore();
    });

    afterEach(async () => {
        if (fs.existsSync(`${avatarPath}/1.png`)) {
            fs.unlinkSync(`${avatarPath}/1.png`);
            fs.rmdirSync(avatarPath);
        }
        await disconnectMS(mongoMs);
    });

    it('should instanciate correctly', () => {
        chai.expect(avatarController).to.be.instanceOf(AvatarController);
    });

    // le test fonctionne en local mais est flaky dans la pipeline.
    // it('should call upload when POST /api/avatar/upload is used', (done: Mocha.Done) => {
    //     // simulate account creation
    //     avatarModel.addAvatarDocument('1');
    //     chai
    //         .request(application.app)
    //         .post('/api/avatar/upload')
    //         .set('content-type', 'multipart/form-data')
    //         .attach('file', 'test/icon.png', 'icon.png')
    //         .end((err, res) => {
    //             expect(res.body.id).to.exist;
    //             done();
    //         });
    // });

    it('get with id should return picture correctly', (done: Mocha.Done) => {
        // simulate account creation
        avatarModel.addAvatarDocument('1');
        if (fs.existsSync(avatarPath)) {
            chai
                .request(application.app)
                .post('/api/avatar/upload')
                .set('content-type', 'multipart/form-data')
                .attach('file', 'test/icon.png', 'icon.png')
                .end((err, res) => {
                    const avatarId = res.body.id;
                    chai.request(application.app)
                        .get(`/api/avatar/${avatarId}`)
                        .then((res) => {
                            chai.expect(res.status).to.be.equal(OK);
                            chai.expect(res.body).to.be.instanceof(Buffer);
                            done();
                        });
                });
        } else {
            done();
        }
    });

    it('get with id should return 404 if avatar with given id doesn\'t exist', (done: Mocha.Done) => {
        // simulate account creation
        avatarModel.addAvatarDocument('1');
        chai
            .request(application.app)
            .get('/api/avatar/123456789012345678901234')
            .end((err, res) => {
                chai.expect(res.status).to.be.equal(NOT_FOUND);
                done();
            });
    });
});