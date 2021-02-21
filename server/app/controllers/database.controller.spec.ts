/* tslint:disable:no-require-imports no-var-requires*/
/* tslint:disable:no-string-literal*/
import * as chai from 'chai';
import 'chai-http';
chai.use(require('chai-http'));

import { testingContainer } from '../../test/test-utils';

import Types from '../types';
import { DatabaseController } from './database.controller';


describe('Database Controller', () => {
  let databaseController: DatabaseController;

  beforeEach(async () => {
    await testingContainer().then((instance) => {
      databaseController = instance[0].get<DatabaseController>(Types.DatabaseController);
    });
  });

  it('should instanciate correctly', (done: Mocha.Done) => {
    chai.expect(databaseController).to.be.instanceOf(DatabaseController);
    done();
  });

});
