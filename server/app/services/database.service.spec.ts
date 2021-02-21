/* tslint:disable:no-any no-magic-numbers */
/* tslint:disable:no-any no-string-literal */
import { expect } from 'chai';

import { DatabaseService } from './database.service';

import { testingContainer } from '../../test/test-utils';
import Types from '../types';

describe('Database Service', () => {
  let databaseService: DatabaseService;

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

  afterEach(async () => {
    await databaseService.disconnectDB();
  });
});
