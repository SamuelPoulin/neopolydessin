import * as bcrypt from 'bcrypt';
import * as express from 'express';
import * as httpStatus from 'http-status-codes';
import { injectable } from 'inversify';
import * as jwt from 'jsonwebtoken';
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

  private static determineStatus(err: Error, results: Account | Account[]): number {
    return err ? httpStatus.INTERNAL_SERVER_ERROR : results ? httpStatus.OK : httpStatus.NOT_FOUND;
  }

  static handleResults(res: express.Response, results: Response<Account> | Response<Account[]>): void {
    results.documents ? res.status(results.statusCode).json(results.documents) : res.sendStatus(results.statusCode);
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
          err ? console.error(err.message) : console.log('Connected to MongoDB');
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
      accountModel.findById(id, (err: Error, doc: Account) => {
        const status = DatabaseService.determineStatus(err, doc);
        resolve({ statusCode: status, documents: doc });
      });
    });
  }

  async getAccountByUsername(id: string): Promise<Response<Account>> {
    return new Promise<Response<Account>>((resolve) => {
      accountModel.findOne({ username: id }, (err: Error, doc: Account) => {
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

  async createAccount(body: Register): Promise<Response<Account>> {
    return new Promise<Response<Account>>((resolve, reject) => {
      const account = {
        name: body.name,
        username: body.username,
        email: body.email,
        password: body.password,
      } as Account;
      const model = new accountModel(account);

      this.getAccountByUsername(account.username).then((found) => {
        if (found.documents !== null) {
          reject(this.rejectMessage(httpStatus.BAD_REQUEST, 'Username already taken'));
        }
        this.getAccountByEmail(account.email).then((foundByEmail) => {
          if (foundByEmail.documents !== null) {
            reject(this.rejectMessage(httpStatus.BAD_REQUEST, 'Email already taken'));
          } else {
            bcrypt.hash(model.password, this.SALT_ROUNDS, (error, hash) => {
              model.password = hash;
              model.save((err: mongoose.Error, doc: Account) => {
                const status = err ? httpStatus.INTERNAL_SERVER_ERROR : httpStatus.OK;
                resolve({ statusCode: status, documents: doc });
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

              // store refresh token in db
              refreshModel.findOneAndUpdate({ accountId: account._id },
                { accountId: account._id, token: jwtRefreshToken },
                { upsert: true, useFindAndModify: false },
                (err: Error, doc: Refresh) => {
                  if (err) {
                    reject(this.rejectMessage(httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong'));
                  }
                });
              resolve([jwtToken, jwtRefreshToken]);
            } else {
              reject(this.rejectMessage(httpStatus.UNAUTHORIZED, 'Wrong password'));
            }
          });
        } else {
          reject(this.rejectMessage(httpStatus.NOT_FOUND, 'Wrong username'));
        }
      });
    });
  }

  async refreshToken(refreshToken: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      refreshModel.findOne({ token: refreshToken }, (err: Error, doc: Refresh) => {
        if (!doc || !process.env.JWT_REFRESH_KEY || !process.env.JWT_KEY) {
          reject(this.rejectMessage(httpStatus.FORBIDDEN, 'Acces denied'));
        } else {
          const decodedPayload = jwt.verify(doc.token, process.env.JWT_REFRESH_KEY);
          const newAccesToken = jwt.sign(
            { _id: decodedPayload },
            process.env.JWT_KEY,
            { expiresIn: '5m' }
          );
          resolve(newAccesToken);
        }
      });
    });
  }

  async logout(refreshToken: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      refreshModel.findOneAndDelete({ token: refreshToken }, undefined, (err: Error, doc: Refresh) => {
        if (err) {
          reject(this.rejectMessage(httpStatus.INTERNAL_SERVER_ERROR, 'Something went wrong'));
        } else {
          resolve(true);
        }
      });
    });
  }

  async deleteAccount(id: string): Promise<Response<Account>> {
    return new Promise<Response<Account>>((resolve, reject) => {
      refreshModel.findOne({ accountId: id }, (err: Error, doc: Refresh) => {
        this.logout(doc.token).then((successfull) => {
          accountModel.findByIdAndDelete(id, null, (error: Error, acc: Account) => {
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

      this.getAccountById(id).then((found) => {
        if (found.statusCode !== httpStatus.NOT_FOUND) {
          if (found.documents.username !== id) {
            this.getAccountByUsername(found.documents.username).then((foundByUsername) => {
              if (foundByUsername.documents !== null) {
                canUpdate = false;
              }
            });
          }
          if (canUpdate && found.documents.email !== body.email) {
            this.getAccountByEmail(found.documents.username).then((foundByEmail) => {
              if (foundByEmail.documents !== null) {
                canUpdate = false;
              }
            });
          }
          if (canUpdate) {
            accountModel.findOneAndUpdate({ username: id }, body, null, (err: Error, doc: Account) => {
              resolve({ statusCode: DatabaseService.determineStatus(err, doc), documents: doc });
            });
          } else {
            reject(this.rejectMessage(httpStatus.BAD_REQUEST, 'Username or Email is already taken'));
          }
        } else {
          reject('Couldn\'t update account. Account doesn\'t exist');
        }
      });
    });
  }

  rejectMessage(errorCode: number, message: string): object {
    return { status: errorCode, error: message };
  }
}
