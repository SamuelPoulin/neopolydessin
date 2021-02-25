import { expect } from 'chai';
import * as httpStatus from 'http-status-codes';
import { Response } from './database.service';
import { describe, beforeEach } from 'mocha';
import { DatabaseService, ErrorMsg, LoginTokens } from './database.service';
import { testingContainer } from '../../test/test-utils';
import Types from '../types';
import { Register } from '../../../common/communication/register';
import { login } from '../../../common/communication/login';
import * as jwt from 'jsonwebtoken';
import { Account } from '../../models/account';

describe('Database Service', () => {
  let databaseService: DatabaseService;

  const accountInfo: Register = {
    firstName: 'name',
    lastName: 'lname',
    username: 'username',
    email: 'email@email.email',
    password: 'monkey123',
    passwordConfirm: 'monkey123'
  }

  const loginInfo: login = {
    username: 'username',
    password: 'monkey123',
  };

  const env = Object.assign({}, process.env);

  before(() => {
    process.env.JWT_KEY = 'this is a super secret secret!!!';
    process.env.JWT_REFRESH_KEY = 'this is another super secret secret!!!';
  });

  after(() => {
    process.env = env;
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

  it('should create an account correctly', (done: Mocha.Done) => {
    databaseService.createAccount(accountInfo).then((result) => {
      expect(result.statusCode).to.equal(httpStatus.OK);
      expect(result.documents).to.not.equal(null);
      expect(result.documents.accessToken).to.not.be.null;
      expect(result.documents.refreshToken).to.not.be.null;
      done();
    });
  });

  it('should receive NOT_FOUND if user doesn\'t exist when logging in', (done: Mocha.Done) => {
    databaseService.login(loginInfo).then((tokens) => {
      expect(tokens).to.be.null;
    }).catch((err: ErrorMsg) => {
      expect(err.statusCode).to.equal(httpStatus.NOT_FOUND);
      expect(err.message).to.equal('Not found');
      done();
    });
  });


  it('should receive UNAUTHORIZED if password doesn\'t match when logging in', (done: Mocha.Done) => {
    const wrongLogin: login = {
      username: 'username',
      password: 'wrongPassword',
    };
    databaseService.createAccount(accountInfo).then((created) => {
      databaseService.login(wrongLogin).then((tokens) => {
        expect(tokens).to.be.null;
      }).catch((err: ErrorMsg) => {
        expect(err.statusCode).to.equal(httpStatus.UNAUTHORIZED);
        expect(err.message).to.equal('Access denied');
        done();
      });
    });
  });

  it('should login successfully', (done: Mocha.Done) => {
    databaseService.createAccount(accountInfo).then((created) => {
      databaseService.login(loginInfo).then((tokens: Response<LoginTokens>) => {
        expect(tokens.documents.accessToken).to.not.be.null;
        expect(tokens.documents.refreshToken).to.not.be.null;
        done();
      });
    });
  });

  it('should be UNAUTHORIZED if refresh token doesn\'t exist', (done: Mocha.Done) => {
    databaseService.refreshToken('invalidToken').catch((err: ErrorMsg) => {
      expect(err.statusCode).to.equal(httpStatus.UNAUTHORIZED);
      expect(err.message).to.equal('Access denied');
      done();
    });
  });

  it('should return a new acces token correctly when calling refreshToken', (done: Mocha.Done) => {
    databaseService.createAccount(accountInfo).then((created: Response<LoginTokens>) => {
      databaseService.refreshToken(created.documents.refreshToken).then((token: string) => {
        expect(token).to.not.be.null;
        done();
      });
    });
  });

  it('checkIfLoggedIn should return UNAUTHORIZED if the user is not logged in', (done: Mocha.Done) => {
    databaseService.checkIfLoggedIn('1').catch((err: ErrorMsg) => {
      expect(err.statusCode).to.equal(httpStatus.UNAUTHORIZED);
      expect(err.message).to.equal('Access denied');
      done();
    })
  });

  it('checkIfLoggedIn should resolve to true if the user is logged in', (done: Mocha.Done) => {
    databaseService.createAccount(accountInfo).then((created) => {
      databaseService.login(loginInfo).then((tokens: Response<LoginTokens>) => {
        if (process.env.JWT_KEY) {
          const decodedJwt: {} = jwt.verify(tokens.documents.accessToken, process.env.JWT_KEY) as object;
          databaseService.checkIfLoggedIn(decodedJwt['_id']).then((loggedIn) => {
            expect(loggedIn).to.be.true;
            done();
          });
        }
      });
    });
  });

  it('should receive NOT_FOUND if user is not logged in when logging out', (done: Mocha.Done) => {
    databaseService.logout('someToken').catch((err: ErrorMsg) => {
      expect(err.statusCode).to.be.equal(httpStatus.NOT_FOUND);
      expect(err.message).to.be.equal('Not found');
      done();
    });
  });

  it('should resolve to true if user logout successfull', (done: Mocha.Done) => {
    databaseService.createAccount(accountInfo).then((created) => {
      databaseService.login(loginInfo).then((tokens: Response<LoginTokens>) => {
        databaseService.logout(tokens.documents.refreshToken).then((successfull) => {
          expect(successfull).to.be.true;
          done();
        });
      });
    });
  });

  it('should receive NOT_FOUND if account doesn\'t exist when deleting account', (done: Mocha.Done) => {
    databaseService.deleteAccount('1').catch((err: ErrorMsg) => {
      expect(err.statusCode).to.be.equal(httpStatus.NOT_FOUND);
      expect(err.message).to.be.equal('Not found');
      done();
    });
  });

  it('should delete account correctly', (done: Mocha.Done) => {
    databaseService.createAccount(accountInfo).then((created) => {
      databaseService.login(loginInfo).then((tokens: Response<LoginTokens>) => {
        if (process.env.JWT_KEY) {
          const decodedJwt: {} = jwt.verify(tokens.documents.accessToken, process.env.JWT_KEY) as object;
          databaseService.deleteAccount(decodedJwt['_id']).then((response: Response<Account>) => {
            expect(response.statusCode).to.equal(httpStatus.OK);
            expect(response.documents.firstName).to.equal('name');
            expect(response.documents.username).to.equal('username');
            expect(response.documents.email).to.equal('email@email.email');
            done();
          });
        }
      });
    });
  });

  it('updateAccount should return NOT_FOUND if account doesn\'t exist', (done: Mocha.Done) => {
    databaseService.updateAccount('123456789012345678901234', {
      firstName: 'newName',
      username: 'newUsername',
      email: 'newEmail@email.email'
    } as Account).catch((err: ErrorMsg) => {
      expect(err.statusCode).to.equal(httpStatus.NOT_FOUND);
      expect(err.message).to.equal('Not found');
      done();
    });
  });

  it('updateAccount should update account correctly', (done: Mocha.Done) => {
    databaseService.createAccount(accountInfo).then((created) => {
      databaseService.login(loginInfo).then((tokens: Response<LoginTokens>) => {
        if (process.env.JWT_KEY) {
          const decodedJwt: {} = jwt.verify(tokens.documents.accessToken, process.env.JWT_KEY) as object;
          databaseService.updateAccount(decodedJwt['_id'], {
            firstName: 'newName',
            username: 'newUsername',
            email: 'newEmail@email.email'
          } as Account).then((response: Response<Account>) => {
            expect(response.statusCode).to.equal(httpStatus.OK)
            expect(response.documents.username).to.equal('username');
            databaseService.getAccountById(decodedJwt['_id']).then((account: Response<Account>) => {
              expect(account.statusCode).to.equal(httpStatus.OK);
              expect(account.documents.username).to.equal('newUsername');
              done();
            });
          });
        }
      });
    });
  });

  afterEach(async () => {
    await databaseService.disconnectDB();
  });
});

