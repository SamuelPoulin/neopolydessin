import * as express from 'express';
import * as httpStatus from 'http-status-codes';
import { injectable } from 'inversify';

import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import accountModel, { Account } from '../../models/account';

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

  async createAccount(body: Account): Promise<Response<Account>> {
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
          reject('Username already taken');
        }
        this.getAccountByEmail(account.email).then((foundByEmail) => {
          if (foundByEmail.documents !== null) {
            reject('Email already taken');
          } else {
            model.save((err: mongoose.Error, doc: Account) => {
              const status = err ? httpStatus.INTERNAL_SERVER_ERROR : httpStatus.OK;
              resolve({ statusCode: status, documents: doc });
            });
          }
        });
      });
    });
  }

  async deleteAccount(id: string): Promise<Response<Account>> {
    return new Promise<Response<Account>>((resolve) => {
      accountModel.findOneAndDelete({ username: id }, null, (err: Error, doc: Account) => {
        resolve({ statusCode: DatabaseService.determineStatus(err, doc), documents: doc });
      });
    });
  }

  async updateAccount(id: string, body: Account): Promise<Response<Account>> {
    return new Promise<Response<Account>>((resolve, reject) => {
      let canUpdate = true;
      this.getAccountByUsername(id).then((found) => {
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
            reject('Couldn\'t update account. Username or Email is already taken');
          }
        } else {
          reject('Couldn\'t update account. Account doesn\'t exist');
        }
      });
    });
  }
}
