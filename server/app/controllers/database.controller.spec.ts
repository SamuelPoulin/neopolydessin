import * as chai from 'chai';
import 'chai-http';
import { describe, beforeEach } from 'mocha';
import * as sinon from 'sinon';
chai.use(require('chai-http'));
import { testingContainer } from '../../test/test-utils';
import { Application } from '../app';
import { DatabaseService } from '../services/database.service';
import Types from '../types';
import { DatabaseController } from './database.controller';
import { Account } from '../../models/account';
import * as jwtVerify from '../middlewares/jwt-verify';
import * as express from 'express';
import { expect } from 'chai';
import { BAD_REQUEST, UNAUTHORIZED } from 'http-status-codes';

describe('Database Controller', () => {
  let application: Application;
  let databaseController: DatabaseController;
  let jwtVerifyStub: any;

  before(() => {
    jwtVerifyStub = sinon.stub(jwtVerify, 'jwtVerify');

    jwtVerifyStub.callsFake(
      (req: express.Request, res: express.Response, next: express.NextFunction) => {
        req.params = { _id: '1' }
        return next();
      });
  });

  after(() => {
    jwtVerifyStub.restore();
  })

  beforeEach(async () => {
    await testingContainer().then((instance) => {
      application = instance[0].get<Application>(Types.Application);
      databaseController = instance[0].get<DatabaseController>(Types.DatabaseController);
    });
  });

  it('should instanciate correctly', (done: Mocha.Done) => {
    chai.expect(databaseController).to.be.instanceOf(DatabaseController);
    done();
  });

  it('should call createAccount when accessing api/database/auth/register', (done: Mocha.Done) => {
    const stub = sinon.stub(DatabaseService.prototype, 'createAccount').resolves({ statusCode: 200, documents: '' });
    chai
      .request(application.app)
      .post('/api/database/auth/register')
      .set('content-type', 'application/json')
      .send({
        name: 'name',
        username: 'username',
        email: 'email@email.email',
        password: 'monkey123',
        passwordConfirm: 'monkey123'
      })
      .then(() => {
        chai.expect(stub.called).to.equal(true);
        stub.restore();
        done();
      });
  });

  it('should call login when accessing api/database/auth/login', (done: Mocha.Done) => {
    const stub = sinon.stub(DatabaseService.prototype, 'login').resolves(['accesToken', 'refreshToken']);
    chai
      .request(application.app)
      .post('/api/database/auth/login')
      .set('content-type', 'application/json')
      .send({
        username: 'username',
        password: 'monkey123'
      })
      .then(() => {
        chai.expect(stub.called).to.equal(true);
        stub.restore();
        done();
      });
  });

  it('should be bad request if body is incomplete when accessing api/database/auth/login', (done: Mocha.Done) => {
    chai
      .request(application.app)
      .post('/api/database/auth/login')
      .set('content-type', 'application/json')
      .send({})
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(BAD_REQUEST);
        done();
      });
  });

  it('should call refreshToken when sending a refresh request to api/database/auth/refresh', (done: Mocha.Done) => {
    const stub = sinon.stub(DatabaseService.prototype, 'refreshToken').resolves("newAccessToken");
    chai
      .request(application.app)
      .post('/api/database/auth/refresh')
      .set('content-type', 'application/json')
      .send({ refreshToken: 'accesToken' })
      .then(() => {
        chai.expect(stub.called).to.equal(true);
        stub.restore();
        done();
      });
  });

  it('should be bad request if body is incomplete when sending a refresh request to api/database/auth/refresh', (done: Mocha.Done) => {
    chai
      .request(application.app)
      .post('/api/database/auth/refresh')
      .set('content-type', 'application/json')
      .send({})
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(BAD_REQUEST);
        done();
      });
  });

  it('should call logout when sending a delete request to api/database/auth/logout', (done: Mocha.Done) => {
    const stub = sinon.stub(DatabaseService.prototype, 'logout').resolves(true);
    chai
      .request(application.app)
      .delete('/api/database/auth/logout')
      .set('content-type', 'application/json')
      .send({ refreshToken: 'refreshToken' })
      .then(() => {
        chai.expect(stub.called).to.equal(true);
        stub.restore();
        done();
      });
  });

  it('should be bad request if body is incomplete when sending a delete request to api/database/auth/logout', (done: Mocha.Done) => {
    chai
      .request(application.app)
      .delete('/api/database/auth/logout')
      .set('content-type', 'application/json')
      .send({})
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(BAD_REQUEST);
        done();
      });
  });

  it('should call getAccountById when sending a query get request to api/database/account', (done: Mocha.Done) => {
    const account = {
      _id: '1',
      name: 'user',
      username: 'username',
      email: 'email@email.email',
      password: 'admin123'
    } as Account

    const loginStub = sinon.stub(DatabaseService.prototype, 'checkIfLoggedIn').resolves(true);
    const stub = sinon.stub(DatabaseService.prototype, 'getAccountById').resolves({ statusCode: 200, documents: account });
    chai
      .request(application.app)
      .get('/api/database/account')
      .set('authorization', 'someToken')
      .then(() => {
        chai.expect(stub.called).to.equal(true);
        stub.restore();
        loginStub.restore();
        done();
      });
  });

  it('should be unauthorized when sending a query get request to api/database/account if user isn\'t logged in', (done: Mocha.Done) => {
    const loginStub = sinon.stub(DatabaseService.prototype, 'checkIfLoggedIn').rejects({ statusCode: UNAUTHORIZED, message: 'Access denied' });
    chai
      .request(application.app)
      .get('/api/database/account')
      .set('authorization', 'someToken')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(UNAUTHORIZED);
        loginStub.restore();
        done();
      });
  });

  it('should call deleteAccount when sending a query delete request to api/database/account', (done: Mocha.Done) => {
    const account = {
      _id: '1',
      name: 'user',
      username: 'username',
      email: 'email@email.email',
      password: 'admin123'
    } as Account

    const loginStub = sinon.stub(DatabaseService.prototype, 'checkIfLoggedIn').resolves(true);
    const stub = sinon.stub(DatabaseService.prototype, 'deleteAccount').resolves({ statusCode: 200, documents: account });
    chai
      .request(application.app)
      .delete('/api/database/account')
      .set('authorization', 'someToken')
      .then(() => {
        chai.expect(stub.called).to.equal(true);
        stub.restore();
        loginStub.restore();
        done();
      });
  });

  it('should call update when sending a post request to api/database/account', (done: Mocha.Done) => {
    const account = {
      _id: '1',
      name: 'user',
      username: 'username',
      email: 'email@email.email',
      password: 'admin123'
    } as Account

    const loginStub = sinon.stub(DatabaseService.prototype, 'checkIfLoggedIn').resolves(true);
    const stub = sinon.stub(DatabaseService.prototype, 'updateAccount').resolves({ statusCode: 200, documents: account });
    chai
      .request(application.app)
      .post('/api/database/account')
      .set('authorization', 'someToken')
      .then(() => {
        chai.expect(stub.called).to.equal(true);
        stub.restore();
        loginStub.restore();
        done();
      });
  });

  it('should be bad request if trying to update password or account id when sending a post request to api/database/account', (done: Mocha.Done) => {
    const account = {
      _id: '12356',
      password: 'admin123'
    } as Account

    chai
      .request(application.app)
      .post('/api/database/account')
      .set('authorization', 'someToken')
      .set('content-type', 'application/json')
      .send(account)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(BAD_REQUEST);
        expect(res.body).to.have.property('errors')
        done();
      });
  });

});
