import { describe } from 'mocha';
import { Request, Response, NextFunction } from 'express'
import sinon from 'sinon';
import { validationCheck } from './validation-check';
import { InternalRequest } from 'express-validator/src/base';

describe('validationCheck', () => {

    let req: Partial<InternalRequest>;
    let res: Partial<Response>;
    let next: NextFunction;

    let statusStub: sinon.SinonStub<any[], any>;
    let jsonStub: sinon.SinonStub<any[], any>;
    let nextStub: sinon.SinonStub<any[], any>;

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

    it('should call next function if validation check passes', () => {
        validationCheck(req as Request, res as Response, next)
        sinon.assert.calledOnce(nextStub);
    });

});
