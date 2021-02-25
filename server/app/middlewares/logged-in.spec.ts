import { describe } from 'mocha';
import { Request, Response, NextFunction } from 'express'
import * as sinon from 'sinon';
import { testingContainer } from '../../test/test-utils';
import { DatabaseService } from '../services/database.service';
import { LoggedIn } from './logged-in';
import Types from '../types';
import { expect } from 'chai';
import { UNAUTHORIZED } from 'http-status-codes';

describe('loggedInMiddleware', () => {

    let dbServiceStub: any;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    let statusStub: sinon.SinonStub<any[], any>;
    let jsonStub: sinon.SinonStub<any[], any>;
    let nextStub: sinon.SinonStub<any[], any>;

    let loggedIn: LoggedIn;

    beforeEach(async () => {
        await testingContainer().then((instance) => {
            dbServiceStub = instance[1].stub(DatabaseService.prototype, 'checkIfLoggedIn');
            loggedIn = instance[0].get<LoggedIn>(Types.LoggedIn);
        });
        statusStub = sinon.stub().returnsThis();
        jsonStub = sinon.stub().returnsThis();
        req = {}
        res = {
            status: statusStub,
            json: jsonStub
        }
        nextStub = sinon.stub().callsFake(() => { });
        next = nextStub;
    });

    it('next middleware should be called if user is logged in', async () => {
        req = {
            params: {
                _id: '1'
            }
        }
        dbServiceStub.resolves(undefined);
        await loggedIn.checkLoggedIn(req as Request, res as Response, next);
        expect(nextStub.calledOnce).to.be.true;
        expect(statusStub.calledOnce).to.be.false
        expect(jsonStub.calledOnce).to.be.false
    });

    it('should return UNATHORIZED if jwt token is has not been extracted before', async () => {
        req = {
            params: {}
        }
        await loggedIn.checkLoggedIn(req as Request, res as Response, next);
        sinon.assert.calledWith(statusStub, UNAUTHORIZED);
        sinon.assert.calledWith(jsonStub, 'Access denied');
    })
});
