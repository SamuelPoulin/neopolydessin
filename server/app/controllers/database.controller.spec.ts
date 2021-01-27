/* tslint:disable:no-require-imports no-var-requires*/
/* tslint:disable:no-string-literal*/
import * as chai from 'chai';
import 'chai-http';
import * as sinon from 'sinon';
chai.use(require('chai-http'));

import { testingContainer } from '../../test/test-utils';
import { Application } from '../app';

import { DatabaseService } from '../services/database.service';
import Types from '../types';
import { DatabaseController } from './database.controller';

import Drawing from '../../models/drawing';

describe('Database Controller', () => {
  let application: Application;
  let databaseController: DatabaseController;

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

  it('should call getAllDrawings when accessing api/database/drawings', (done: Mocha.Done) => {
    const stub = sinon.stub(DatabaseService.prototype, 'getAllDrawings').resolves({ statusCode: 200, documents: [] });
    chai
      .request(application.app)
      .get('/api/database/drawings')
      .then(() => {
        chai.expect(stub.called).to.equal(true);
        stub.restore();
        done();
      });
  });

  it('should call getDrawingById when accessing api/database/drawings/:id', (done: Mocha.Done) => {
    const drawing = new Drawing();
    const stub = sinon.stub(DatabaseService.prototype, 'getDrawingById').resolves({ statusCode: 200, documents: drawing });
    chai
      .request(application.app)
      .get('/api/database/drawings/test')
      .then(() => {
        chai.expect(stub.called).to.equal(true);
        stub.restore();
        done();
      });
  });

  it('should call addDrawing when sending a POST request to api/database/drawings', (done: Mocha.Done) => {
    const drawing = new Drawing();
    const stub = sinon.stub(DatabaseService.prototype, 'addDrawing').resolves({ statusCode: 200, documents: drawing });
    chai
      .request(application.app)
      .post('/api/database/drawings')
      .set('content-type', 'application/json')
      .send({ data: 'random data' })
      .then(() => {
        chai.expect(stub.called).to.equal(true);
        stub.restore();
        done();
      });
  });

  it('should call deleteDrawing when sending a delete request to api/database/drawings/:id', (done: Mocha.Done) => {
    const drawing = new Drawing();
    const stub = sinon.stub(DatabaseService.prototype, 'deleteDrawing').resolves({ statusCode: 200, documents: drawing });
    chai
      .request(application.app)
      .delete('/api/database/drawings/test')
      .then(() => {
        chai.expect(stub.called).to.equal(true);
        stub.restore();
        done();
      });
  });

  it('should call updateDrawing when sending a post request to api/database/drawings/id', (done: Mocha.Done) => {
    const drawing = new Drawing();
    const stub = sinon.stub(DatabaseService.prototype, 'updateDrawing').resolves({ statusCode: 200, documents: drawing });
    chai
      .request(application.app)
      .post('/api/database/drawings/test')
      .set('content-type', 'application/json')
      .send({ data: 'random data' })
      .then(() => {
        chai.expect(stub.called).to.equal(true);
        stub.restore();
        done();
      });
  });

  it('should call searchDrawingss when sending a query get request to api/database/drawing/', (done: Mocha.Done) => {
    const stub = sinon.stub(DatabaseService.prototype, 'searchDrawings').resolves({ statusCode: 200, documents: [] });
    chai
      .request(application.app)
      .get('/api/database/drawing/?name=')
      .then(() => {
        chai.expect(stub.called).to.equal(true);
        stub.restore();
        done();
      });
  });
});
