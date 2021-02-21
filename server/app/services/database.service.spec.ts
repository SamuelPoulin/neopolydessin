import { expect } from 'chai';
import * as httpStatus from 'http-status-codes';
import { DatabaseService } from './database.service';
import { testingContainer } from '../../test/test-utils';
import Types from '../types';
import { Register } from '../../../common/communication/register';
// import accountModel from '../../models/account';

describe('Database Service', () => {
  let databaseService: DatabaseService;

  // const testAccount = new accountModel({
  //   name: 'name',
  //   username: 'username',
  //   email: 'email@email.email',
  //   password: 'monkey123',
  // });

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

  it('should create an account correctly', (done: Mocha.Done) => {
    const accountInfo: Register = {
      name: 'name',
      username: 'username',
      email: 'email@email.email',
      password: 'monkey123',
      passwordConfirm: 'monkey123'
    }
    databaseService.createAccount(accountInfo).then((result) => {
      expect(result.statusCode).to.equal(httpStatus.OK);
      expect(result.documents).to.not.equal(null);
      expect(result.documents).to.equal('Account successfully created');
      done();
    });
  });

  afterEach(async () => {
    await databaseService.disconnectDB();
  });
});
