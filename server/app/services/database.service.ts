import * as bcrypt from 'bcrypt';
import * as express from 'express';
import * as httpStatus from 'http-status-codes';
import { injectable } from 'inversify';
import * as jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import { login } from '../../../common/communication/login';
import { Register } from '../../../common/communication/register';
import accountModel, { Account } from '../../models/account';
import refreshModel, { Refresh } from '../../models/refresh';
import friendModel, { Friends } from '../../models/friends';

export interface Response<T> {
  statusCode: number;
  documents: T;
}

export interface ErrorMsg {
  statusCode: number;
  message: string;
}

interface AccessToken {
  _id: string;
  iat: number;
  exp: number;
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

  static rejectMessage(errorCode: number, msg: string): ErrorMsg {
    return { statusCode: errorCode, message: msg };
  }

  static handleResults(res: express.Response, results: Response<Account> | Response<Account[]>): void {
    if (results.documents) {
      res.status(results.statusCode).json(results.documents);
    } else {
      res.sendStatus(results.statusCode);
    }
  }

  private static determineStatus(err: Error, results: Account | Account[]): number {
    return err ? httpStatus.INTERNAL_SERVER_ERROR : results ? httpStatus.OK : httpStatus.NOT_FOUND;
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

  async createAccount(body: Register): Promise<Response<string>> {
    return new Promise<Response<string>>((resolve, reject) => {
      const account = {
        name: body.name,
        username: body.username,
        email: body.email,
        password: body.password,
      } as Account;
      const model = new accountModel(account);

      this.getAccountByUsername(account.username).then((found) => {
        if (found.documents !== null) {
          reject(DatabaseService.rejectMessage(httpStatus.BAD_REQUEST, 'Username already taken'));
        }
        this.getAccountByEmail(account.email).then((foundByEmail) => {
          if (foundByEmail.documents !== null) {
            reject(DatabaseService.rejectMessage(httpStatus.BAD_REQUEST, 'Email already taken'));
          } else {
            bcrypt.hash(model.password, this.SALT_ROUNDS, (error, hash) => {
              model.password = hash;
              model.save((err: mongoose.Error, doc: Account) => {
                if (err) {
                  reject(DatabaseService.rejectMessage(httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong'));
                } else {
                  const friends = new friendModel({
                    accountId: doc._id,
                  });
                  friends.save((friendErr: mongoose.Error, document: Friends) => {
                    if (friendErr) {
                      reject(DatabaseService.rejectMessage(httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong'));
                    } else {
                      resolve({ statusCode: httpStatus.OK, documents: 'Account successfully created' });
                    }
                  });
                }
              });
            });
          }
        });
      });
    });
  }

  async login(loginInfo: login): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      this.getAccountByUsername(loginInfo.username).then((results) => {
        const account = results.documents;
        if (account !== null) {
          bcrypt.compare(loginInfo.password, account.password).then((match) => {
            if (match && process.env.JWT_KEY && process.env.JWT_REFRESH_KEY) {

              // generate jwt access token
              const jwtToken = jwt.sign(
                { _id: account._id },
                process.env.JWT_KEY,
                { expiresIn: '5m' });

              // generate jwt refresh token for session
              const jwtRefreshToken = jwt.sign(
                { _id: account._id },
                process.env.JWT_REFRESH_KEY,
                { expiresIn: '1d' });

              refreshModel.findOneAndDelete({ accountId: account._id }, undefined, (err: Error, doc: Refresh) => {
                if (err) {
                  reject(DatabaseService.rejectMessage(httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong'));
                }
              });

              const refresh = new refreshModel({
                _id: new mongoose.Types.ObjectId(),
                accountId: account._id,
                token: jwtRefreshToken
              });
              refreshModel.create(refresh).then((doc: Refresh) => {
                resolve([jwtToken, doc.token]);
              }).catch((err: Error) => {
                reject(DatabaseService.rejectMessage(httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong'));
              });
            } else {
              reject(DatabaseService.rejectMessage(httpStatus.UNAUTHORIZED, 'Wrong password'));
            }
          });
        } else {
          reject(DatabaseService.rejectMessage(httpStatus.NOT_FOUND, 'Wrong username'));
        }
      });
    });
  }

  async refreshToken(refreshToken: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      refreshModel.findOne({ token: refreshToken }, (err: Error, doc: Refresh) => {
        if (!doc || !process.env.JWT_REFRESH_KEY || !process.env.JWT_KEY) {
          reject(DatabaseService.rejectMessage(httpStatus.FORBIDDEN, 'Access denied'));
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
      refreshModel.findOne({ accountId: id }, (err: Error, doc: Refresh) => {
        if (err) {
          reject(DatabaseService.rejectMessage(httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong'));
        } else if (doc) {
          resolve(true);
        } else {
          reject(DatabaseService.rejectMessage(httpStatus.UNAUTHORIZED, 'Access denied'));
        }
      });
    });
  }

  async logout(refreshToken: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      refreshModel.findOneAndDelete({ token: refreshToken }, undefined, (err: Error, doc: Refresh) => {
        if (err) {
          reject(DatabaseService.rejectMessage(httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong'));
        }
        if (doc) {
          resolve(true);
        } else {
          reject(DatabaseService.rejectMessage(httpStatus.NOT_FOUND, 'User is not logged in'));
        }
      });
    });
  }

  async deleteAccount(id: string): Promise<Response<Account>> {
    return new Promise<Response<Account>>((resolve, reject) => {
      refreshModel.findOne({ accountId: id }, (err: Error, doc: Refresh) => {
        this.logout(doc.token).then((successfull) => {
          accountModel.findByIdAndDelete(id, null, (error: Error, acc: Account) => {
            friendModel.findOneAndDelete({ accountId: id }, undefined, (friendErr: Error, friends: Friends) => {
              resolve({ statusCode: DatabaseService.determineStatus(err, acc), documents: acc });
            });
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
        if (found.statusCode !== httpStatus.NOT_FOUND) {
          if (found.documents.username !== body.username) {
            await this.getAccountByUsername(body.username).then((foundByUsername) => {
              console.log(foundByUsername);
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
            accountModel.findByIdAndUpdate(new ObjectId(id), body, { useFindAndModify: false }, (err: Error, doc: Account) => {
              resolve({ statusCode: DatabaseService.determineStatus(err, doc), documents: doc });
            });
          } else {
            reject(DatabaseService.rejectMessage(httpStatus.BAD_REQUEST, 'Username or Email is already taken'));
          }
        } else {
          reject(DatabaseService.rejectMessage(httpStatus.NOT_FOUND, "Account doesn't exist"));
        }
      });
    });
  }


}
