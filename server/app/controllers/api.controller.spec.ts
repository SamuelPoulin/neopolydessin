/* tslint:disable:no-require-imports no-var-requires*/
import * as chai from 'chai';
import 'chai-http';
chai.use(require('chai-http'));
import * as sinon from 'sinon';
import { testingContainer } from '../../test/test-utils';
import { Application } from '../app';
import { EmailService } from '../services/email.service';
import Types from '../types';
import { APIController } from './api.controller';

describe('API Controller', () => {
  let apiController: APIController;
  let application: Application;
  beforeEach(async () => {
    await testingContainer().then((instance) => {
      application = instance[0].get<Application>(Types.Application);
      apiController = instance[0].get<APIController>(Types.APIController);
    });
  });

  it('should instanciate correctly', (done: Mocha.Done) => {
    chai.expect(apiController).to.be.instanceOf(APIController);
    done();
  });
  it('should call sendEmail when sending a POST request to api/email', (done: Mocha.Done) => {
    const response = '';
    const stub = sinon.stub(EmailService.prototype, 'sendEmail').resolves(response);
    chai
      .request(application.app)
      .post('/api/email')
      .set('content-type', 'application/json')
      .send({ data: 'random data' })
      .then(() => {
        chai.expect(stub.called).to.equal(true);
        stub.restore();
        done();
      });
  });

});
