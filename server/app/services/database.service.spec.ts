/* tslint:disable:no-any no-magic-numbers */
/* tslint:disable:no-any no-string-literal */
import { expect } from 'chai';
import * as httpStatus from 'http-status-codes';

import drawingModel from '../../models/drawing';
import { DatabaseService } from './database.service';

import { testingContainer } from '../../test/test-utils';
import Types from '../types';

describe('Database Service', () => {
  let databaseService: DatabaseService;
  const testingDrawing = new drawingModel({
    name: 'test',
    tags: ['tag1', 'tag2', 'tag3'],
    data: 'random data',
    color: '',
    width: 0,
    height: 0,
    previewURL: 'www',
  });

  beforeEach(async () => {
    await testingContainer().then((instance) => {
      databaseService = instance[0].get<DatabaseService>(Types.DatabaseService);
    });

    await databaseService.connectMS();
  });

  it('should instanciate correctly', (done: Mocha.Done) => {
    expect(databaseService).to.be.instanceOf(DatabaseService);
    done();
  });

  it('should add a drawing correctly', (done: Mocha.Done) => {
    databaseService.addDrawing(testingDrawing).then((result) => {
      expect(result.statusCode).to.equal(httpStatus.OK);
      expect(result.documents).to.not.equal(null);
      expect(result.documents.name).to.equal('test');
      done();
    });
  });

  it('should get all drawings', (done: Mocha.Done) => {
    databaseService.getAllDrawings().then((result) => {
      expect(result.statusCode).to.equal(httpStatus.OK);
      done();
    });
  });

  it('should get one drawing after adding it', (done: Mocha.Done) => {
    databaseService.addDrawing(testingDrawing).then(() => {
      databaseService.getAllDrawings().then((result) => {
        expect(result.statusCode).to.equal(httpStatus.OK);
        expect(result.documents.length).to.equal(1);
        done();
      });
    });
  });

  it('should report error on incorrect ID format', (done: Mocha.Done) => {
    databaseService.getDrawingById('randomid').then((result) => {
      expect(result.statusCode).to.equal(httpStatus.INTERNAL_SERVER_ERROR);
      done();
    });
  });

  it('should report not found on correct ID format', (done: Mocha.Done) => {
    databaseService.getDrawingById('5e78f886b368e63343f98f8b').then((result) => {
      expect(result.statusCode).to.equal(httpStatus.NOT_FOUND);
      done();
    });
  });

  it('should find a drawing that was added earlier', (done: Mocha.Done) => {
    databaseService.addDrawing(testingDrawing).then((addedDoc) => {
      databaseService.getDrawingById(addedDoc.documents._id).then((foundDoc) => {
        expect(addedDoc.documents.name).to.equal(foundDoc.documents.name);
        done();
      });
    });
  });

  it('should find and delete a drawing that was added earlier', (done: Mocha.Done) => {
    databaseService.addDrawing(testingDrawing).then((addedDoc) => {
      databaseService.deleteDrawing(addedDoc.documents._id).then((deletedDoc) => {
        expect(addedDoc.documents.name).to.equal(deletedDoc.documents.name);
        databaseService.getDrawingById(deletedDoc.documents._id).then((foundDoc) => {
          expect(foundDoc.documents).to.equal(null);
          done();
        });
      });
    });
  });

  it('should return the old document on update', (done: Mocha.Done) => {
    databaseService.addDrawing(testingDrawing).then((addedDoc) => {
      databaseService.updateDrawing(addedDoc.documents._id, '{"name":"new name"}').then((oldDoc) => {
        expect(oldDoc.documents.name).to.equal(addedDoc.documents.name);
        done();
      });
    });
  });

  it('should return a document when searching by name', (done: Mocha.Done) => {
    databaseService.addDrawing(testingDrawing).then((addedDoc) => {
      databaseService.searchDrawings('test', '').then((foundDoc) => {
        expect(foundDoc.documents[0].name).to.equal(addedDoc.documents.name);
        done();
      });
    });
  });

  it('should return a document when searching by one tag', (done: Mocha.Done) => {
    databaseService.addDrawing(testingDrawing).then((addedDoc) => {
      databaseService.searchDrawings('', 'tag1').then((foundDoc) => {
        expect(foundDoc.documents[0].name).to.equal(addedDoc.documents.name);
        done();
      });
    });
  });

  it('should return a document when searching by one incomplete tag', (done: Mocha.Done) => {
    databaseService.addDrawing(testingDrawing).then((addedDoc) => {
      databaseService.searchDrawings('', 'tag').then((foundDoc) => {
        expect(foundDoc.documents[0].name).to.equal(addedDoc.documents.name);
        done();
      });
    });
  });

  it('should return a document when searching by incomplete tag array', (done: Mocha.Done) => {
    databaseService.addDrawing(testingDrawing).then((addedDoc) => {
      databaseService.searchDrawings('', ['tag', 'tag']).then((foundDoc) => {
        expect(foundDoc.documents[0].name).to.equal(addedDoc.documents.name);
        done();
      });
    });
  });

  it('should return a document when searching by tag array', (done: Mocha.Done) => {
    databaseService.addDrawing(testingDrawing).then((addedDoc) => {
      databaseService.searchDrawings('', ['tag1', 'tag2']).then((foundDoc) => {
        expect(foundDoc.documents[0].name).to.equal(addedDoc.documents.name);
        done();
      });
    });
  });

  afterEach(async () => {
    await databaseService.disconnectDB();
  });
});
