import * as bcrypt from 'bcrypt';
import * as express from 'express';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND, OK, UNAUTHORIZED } from 'http-status-codes';
import { injectable } from 'inversify';
import * as jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import { login } from '../../../common/communication/login';
import { Register } from '../../../common/communication/register';
import accountModel, { Account } from '../../models/account';
import refreshModel, { Refresh } from '../../models/refresh';

export interface Response<T> {
  statusCode: number;
  documents: T;
}

export interface ErrorMsg {
  statusCode: number;
  message: string | undefined;
}

interface AccessToken {
  _id: string;
  iat: number;
  exp: number;
}

interface Login {
  accessToken: string;
  refreshToken: string;
}

@injectable()
export class DatabaseService {

  private static readonly CONNECTION_OPTIONS: mongoose.ConnectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  readonly SALT_ROUNDS: number = 10;

  mongoMS: MongoMemoryServer;

  constructor() {
    if (process.env.NODE_ENV !== 'test') {
      this.connectDB();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static rejectMessage(errorCode: number, msg?: string): ErrorMsg {
    let rejectionMsg: string | undefined = msg;
    if (!rejectionMsg) {
      switch (errorCode) {
        case INTERNAL_SERVER_ERROR:
          rejectionMsg = 'Something went wrong';
          break;
        case UNAUTHORIZED:
          rejectionMsg = 'Access denied';
          break;
        case NOT_FOUND:
          rejectionMsg = 'Not found';
          break;
        case BAD_REQUEST:
          rejectionMsg = 'Bad request';
          break;
      }
    }
    return { statusCode: errorCode, message: rejectionMsg };
  }

  static handleResults(res: express.Response, results: Response<Account> | Response<Account[]>): void {
    if (results.documents) {
      res.status(results.statusCode).json(results.documents);
    } else {
      res.sendStatus(results.statusCode);
    }
  }

  private static determineStatus(err: Error, results: Account | Account[]): number {
    return err ? INTERNAL_SERVER_ERROR : results ? OK : NOT_FOUND;
  }

  // Documentation de mongodb-memory-server sur Github
  // https://github.com/nodkz/mongodb-memory-server
  async connectMS(): Promise<void> {
    this.mongoMS = new MongoMemoryServer();
    return this.mongoMS.getUri().then((mongoUri) => {
      mongoose.connect(mongoUri, DatabaseService.CONNECTION_OPTIONS);

      mongoose.connection.once('open', () => {
        console.log(`MongoDB successfully connected local instance ${mongoUri}`);
      });
    });
  }

  connectDB(): void {
    if (process.env.MONGODB_KEY) {
      mongoose.connect(
        process.env.MONGODB_KEY,
        DatabaseService.CONNECTION_OPTIONS,
        (err: mongoose.Error) => {
          if (err) {
            console.error(err.message);
          } else {
            console.log('Connected to MongoDB Atlas Cloud');
          }
        },
      );
    }
  }

  async disconnectDB(): Promise<void> {
    await mongoose.disconnect();
    if (this.mongoMS) {
      await this.mongoMS.stop();
    }
  }

  async getAccountById(id: string): Promise<Response<Account>> {
    return new Promise<Response<Account>>((resolve) => {
      accountModel.findById(new ObjectId(id), (err: Error, doc: Account) => {
        const status = DatabaseService.determineStatus(err, doc);
        resolve({ statusCode: status, documents: doc });
      });
    });
  }

  async getAccountByUsername(userName: string): Promise<Response<Account>> {
    return new Promise<Response<Account>>((resolve) => {
      accountModel.findOne({ username: userName }, (err: Error, doc: Account) => {
        const status = DatabaseService.determineStatus(err, doc);
        resolve({ statusCode: status, documents: doc });
      });
    });
  }

  async getAccountByEmail(mail: string): Promise<Response<Account>> {
    return new Promise<Response<Account>>((resolve) => {
      accountModel.findOne({ email: mail }, (err: Error, doc: Account) => {
        const status = DatabaseService.determineStatus(err, doc);
        resolve({ statusCode: status, documents: doc });
      });
    });
  }

  async createAccount(body: Register): Promise<Response<Login>> {
    return new Promise<Response<Login>>((resolve, reject) => {
      const account = {
        name: body.name,
        username: body.username,
        email: body.email,
        password: body.password,
      } as Account;
      const model = new accountModel(account);

      this.getAccountByUsername(account.username).then((found) => {
        if (found.documents !== null) {
          reject(DatabaseService.rejectMessage(BAD_REQUEST, 'Username already taken'));
        }
        this.getAccountByEmail(account.email).then((foundByEmail) => {
          if (foundByEmail.documents !== null) {
            reject(DatabaseService.rejectMessage(BAD_REQUEST, 'Email already taken'));
          } else {
            bcrypt.hash(model.password, this.SALT_ROUNDS, (error, hash) => {
              model.password = hash;
              model.save((err: mongoose.Error) => {
                if (err) {
                  reject(DatabaseService.rejectMessage(INTERNAL_SERVER_ERROR));
                } else {
                  this.login({ username: body.username, password: body.password }).then((tokens) => {
                    resolve(tokens);
                  }).catch((failedLogin: ErrorMsg) => {
                    reject(failedLogin);
                  });
                }
              });
            });
          }
        });
      });
    });
  }

  async login(loginInfo: login): Promise<Response<Login>> {
    return new Promise<Response<Login>>((resolve, reject) => {
      this.getAccountByUsername(loginInfo.username).then((results) => {
        const account = results.documents;
        if (!account) {
          reject(DatabaseService.rejectMessage(NOT_FOUND));
        } else {
          bcrypt.compare(loginInfo.password, account.password).then((match) => {
            if (!match || !process.env.JWT_KEY || !process.env.JWT_REFRESH_KEY) {
              reject(DatabaseService.rejectMessage(UNAUTHORIZED));
            } else {
              // generate jwt access token
              const jwtToken = jwt.sign({ _id: account._id }, process.env.JWT_KEY, { expiresIn: '5m' });
              // generate jwt refresh token for session
              const jwtRefreshToken = jwt.sign({ _id: account._id }, process.env.JWT_REFRESH_KEY, { expiresIn: '1d' });

              refreshModel
                .findOneAndDelete({ accountId: account._id.toHexString() })
                .exec((err: Error, doc: Refresh) => {
                  if (err) {
                    reject(DatabaseService.rejectMessage(INTERNAL_SERVER_ERROR));
                  }
                });

              const refresh = new refreshModel({
                _id: new mongoose.Types.ObjectId(),
                accountId: account._id,
                token: jwtRefreshToken
              });
              refreshModel.create(refresh).then((doc: Refresh) => {
                resolve({ statusCode: OK, documents: { accessToken: jwtToken, refreshToken: doc.token } });
              }).catch((err: Error) => {
                reject(DatabaseService.rejectMessage(INTERNAL_SERVER_ERROR));
              });
            }
          });
        }
      });
    });
  }

  async refreshToken(refreshToken: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      refreshModel
        .findOne({ token: refreshToken })
        .exec((err: Error, doc: Refresh) => {
          console.log(doc);
          if (!doc || !process.env.JWT_REFRESH_KEY || !process.env.JWT_KEY) {
            reject(DatabaseService.rejectMessage(UNAUTHORIZED));
          } else {
            const decodedPayload: AccessToken = jwt.verify(doc.token, process.env.JWT_REFRESH_KEY) as AccessToken;
            const newAccesToken = jwt.sign(
              { _id: decodedPayload._id },
              process.env.JWT_KEY,
              { expiresIn: '5m' }
            );
            resolve(newAccesToken);
          }
        });
    });
  }

  async checkIfLoggedIn(id: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      refreshModel
        .findOne({ accountId: id })
        .exec((err: Error, doc: Refresh) => {
          if (err) {
            reject(DatabaseService.rejectMessage(INTERNAL_SERVER_ERROR));
          } else if (!doc) {
            reject(DatabaseService.rejectMessage(UNAUTHORIZED));
          } else {
            resolve(true);
          }
        });
    });
  }

  async logout(refreshToken: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      refreshModel
        .findOneAndDelete({ token: refreshToken })
        .exec((err: Error, doc: Refresh) => {
          if (err) {
            reject(DatabaseService.rejectMessage(INTERNAL_SERVER_ERROR));
          }
          if (!doc) {
            reject(DatabaseService.rejectMessage(NOT_FOUND, 'User is not logged in'));
          } else {
            resolve(true);
          }
        });
    });
  }

  async deleteAccount(id: string): Promise<Response<Account>> {
    return new Promise<Response<Account>>((resolve, reject) => {
      refreshModel
        .findOne({ accountId: id })
        .exec((err: Error, doc: Refresh) => {
          this.logout(doc.token).then((successfull) => {
            accountModel
              .findByIdAndDelete(id)
              .exec((error: Error, acc: Account) => {
                resolve({ statusCode: DatabaseService.determineStatus(err, acc), documents: acc });
              });
          }).catch((error) => {
            reject(error);
          });
        });
    });
  }

  async updateAccount(id: string, body: Account): Promise<Response<Account>> {
    return new Promise<Response<Account>>((resolve, reject) => {
      let canUpdate = true;
      this.getAccountById(id).then(async (found) => {
        if (found.statusCode !== NOT_FOUND) {
          if (found.documents.username !== body.username) {
            await this.getAccountByUsername(body.username).then((foundByUsername) => {
              if (foundByUsername.documents !== null) {
                canUpdate = false;
              }
            });
          }
          if (canUpdate && found.documents.email !== body.email) {
            await this.getAccountByEmail(body.email).then((foundByEmail) => {
              if (foundByEmail.documents !== null) {
                canUpdate = false;
              }
            });
          }
          if (canUpdate) {
            accountModel
              .findByIdAndUpdate(new ObjectId(id), body, { useFindAndModify: false })
              .exec((err: Error, doc: Account) => {
                resolve({ statusCode: DatabaseService.determineStatus(err, doc), documents: doc });
              });
          } else {
            reject(DatabaseService.rejectMessage(BAD_REQUEST, 'Username or Email is already taken'));
          }
        } else {
          reject(DatabaseService.rejectMessage(NOT_FOUND, "Account doesn't exist"));
        }
      });
    });
  }


}
