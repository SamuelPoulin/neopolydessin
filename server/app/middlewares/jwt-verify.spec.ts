import * as chai from 'chai';
import * as jwt from 'jsonwebtoken';
import { describe } from 'mocha';
import 'chai-http';
chai.use(require('chai-http'));
import { jwtVerify } from './jwt-verify';
import { Request, Response, NextFunction } from 'express'
import { FORBIDDEN } from 'http-status-codes';
import * as sinon from 'sinon';

describe('jwtVerify', () => {

    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    let statusStub: sinon.SinonStub<any[], any>;
    let jsonStub: sinon.SinonStub<any[], any>;
    let nextStub: sinon.SinonStub<any[], any>;

    const env = Object.assign({}, process.env);

    beforeEach(() => {
        req = {}
        statusStub = sinon.stub().returnsThis();
        jsonStub = sinon.stub().returnsThis();
        res = {
            status: statusStub,
            json: jsonStub
        }
        nextStub = sinon.stub();
        next = nextStub;
    });

    it('response should be Forbidden if no token is supplied', (done: Mocha.Done) => {
        jwtVerify(req as Request, res as Response, next);
        sinon.assert.calledWith(statusStub, FORBIDDEN);
        sinon.assert.calledWith(jsonStub, { error: 'invalid access token' });
        done();
    });

    it('response should be Forbidden if wrong token is supplied', (done: Mocha.Done) => {
        req = {
            params: {},
            headers: {
                authorization: 'someToken'
            }
        }
        jwtVerify(req as Request, res as Response, next);
        sinon.assert.calledWith(statusStub, FORBIDDEN);
        sinon.assert.calledWith(jsonStub, { error: 'invalid access token' });
        done();
    });

    it('next middleware should be called if token is valid', (done: Mocha.Done) => {
        process.env.JWT_KEY = 'this is a super secret secret!!!'
        let jwtToken: string = jwt.sign({ _id: '1' },
            process.env.JWT_KEY,
            { expiresIn: '5m' });
        req = {
            params: {},
            headers: {
                authorization: jwtToken
            }
        }

        jwtVerify(req as Request, res as Response, next);
        sinon.assert.called(nextStub);
        process.env = env;
        done();
    });
});
