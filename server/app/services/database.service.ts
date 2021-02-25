import * as bcrypt from 'bcrypt';
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
import { AccessToken } from '../middlewares/jwt-verify';

export interface Response<T> {
  statusCode: number;
  documents: T;
}

export interface ErrorMsg {
  statusCode: number;
  message: string | undefined;
}

export interface LoginTokens {
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

  static rejectErrorMessage(err: Error | ErrorMsg): ErrorMsg {
    if (err instanceof Error) {
      return DatabaseService.rejectMessage(Number(err.message ? err.message : INTERNAL_SERVER_ERROR));
    } else {
      return err;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static rejectMessage(errorCode: number, msg?: string): ErrorMsg {
    let rejectionMsg: string | undefined = msg;
    if (!rejectionMsg) {
      switch (errorCode) {
        case UNAUTHORIZED:
          rejectionMsg = 'Access denied';
          break;
        case NOT_FOUND:
          rejectionMsg = 'Not found';
          break;
        case BAD_REQUEST:
          rejectionMsg = 'Bad request';
          break;
        case INTERNAL_SERVER_ERROR:
          rejectionMsg = 'Something went wrong';
          break;
      }
    }
    return { statusCode: errorCode, message: rejectionMsg };
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
      mongoose.connect(process.env.MONGODB_KEY, DatabaseService.CONNECTION_OPTIONS)
        .then(() => {
          console.log('Connected to MongoDB');
        })
        .catch((err: mongoose.Error) => {
          console.error(err.message);
        });
    }
  }

  async disconnectDB(): Promise<void> {
    await mongoose.disconnect();
    if (this.mongoMS) {
      await this.mongoMS.stop();
    }
  }

  async getAccountById(id: string): Promise<Response<Account>> {
    return new Promise<Response<Account>>((resolve, reject) => {
      accountModel.findById(new ObjectId(id))
        .then((doc: Account) => {
          if (!doc) throw new Error(NOT_FOUND.toString());
          resolve({ statusCode: OK, documents: doc });
        })
        .catch((err: Error) => {
          reject(DatabaseService.rejectErrorMessage(err));
        });
    });
  }


  async getAccountByUsername(userName: string): Promise<Response<Account>> {
    return new Promise<Response<Account>>((resolve, reject) => {
      accountModel.findOne({ username: userName })
        .then((doc: Account) => {
          if (!doc) throw new Error(NOT_FOUND.toString());
          resolve({ statusCode: OK, documents: doc });
        })
        .catch((err: Error) => {
          reject(DatabaseService.rejectErrorMessage(err));
        });
    });
  }

  async getAccountByEmail(mail: string): Promise<Response<Account>> {
    return new Promise<Response<Account>>((resolve, reject) => {
      accountModel.findOne({ email: mail })
        .then((doc: Account) => {
          if (!doc) throw new Error(NOT_FOUND.toString());
          resolve({ statusCode: OK, documents: doc });
        })
        .catch((err: Error) => {
          reject(DatabaseService.rejectErrorMessage(err));
        });
    });
  }

  async createAccount(body: Register): Promise<Response<LoginTokens>> {
    return new Promise<Response<LoginTokens>>((resolve, reject) => {
      const account = {
        firstName: body.firstName,
        lastName: body.lastName,
        username: body.username,
        email: body.email,
        password: body.password,
      } as Account;
      const model = new accountModel(account);

      this.getAccountByUsername(account.username)
        .then(async (found: Response<Account>) => {
          throw new Error(BAD_REQUEST.toString());
        })
        .catch(async (err: ErrorMsg) => {
          if (err.statusCode !== NOT_FOUND) throw Error();
          return this.getAccountByEmail(account.email);
        })
        .then(async (found: Response<Account>) => {
          throw Error(BAD_REQUEST.toString());
        })
        .catch(async (err: ErrorMsg) => {
          if (err.statusCode !== NOT_FOUND) throw Error();
          return bcrypt.hash(model.password, this.SALT_ROUNDS);
        })
        .then(async (hash) => {
          model.password = hash;
          return model.save();
        })
        .then(async (acc: Account) => {
          return this.login({ username: body.username, password: body.password });
        })
        .then((tokens: Response<LoginTokens>) => {
          resolve(tokens);
        })
        .catch((err: Error) => {
          reject(DatabaseService.rejectErrorMessage(err));
        });
    });
  }

  async login(loginInfo: login): Promise<Response<LoginTokens>> {
    return new Promise<Response<LoginTokens>>((resolve, reject) => {
      let account: Account;
      let jwtToken: string;
      let jwtRefreshToken: string;

      this.getAccountByUsername(loginInfo.username)
        .then(async (results: Response<Account>) => {
          account = results.documents;
          return bcrypt.compare(loginInfo.password, account.password);
        })
        .then((match) => {
          if (!match || !process.env.JWT_KEY || !process.env.JWT_REFRESH_KEY) throw Error(UNAUTHORIZED.toString());
          jwtToken = jwt.sign({ _id: account._id }, process.env.JWT_KEY, { expiresIn: '5m' });
          jwtRefreshToken = jwt.sign({ _id: account._id }, process.env.JWT_REFRESH_KEY, { expiresIn: '1d' });
          return refreshModel.findOneAndDelete({ accountId: account._id.toHexString() });
        })
        .then(async () => {
          const refresh = new refreshModel({
            _id: new mongoose.Types.ObjectId(),
            accountId: account._id,
            token: jwtRefreshToken
          });
          return refreshModel.create(refresh);
        })
        .then((doc: Refresh) => {
          resolve({ statusCode: OK, documents: { accessToken: jwtToken, refreshToken: doc.token } });
        })
        .catch((err: Error | ErrorMsg) => {
          reject(DatabaseService.rejectErrorMessage(err));
        });
    });
  }

  async refreshToken(refreshToken: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      refreshModel
        .findOne({ token: refreshToken })
        .then((doc: Refresh) => {
          if (!doc || !process.env.JWT_REFRESH_KEY || !process.env.JWT_KEY) throw Error();
          const decodedPayload: AccessToken = jwt.verify(doc.token, process.env.JWT_REFRESH_KEY) as AccessToken;
          const newAccesToken = jwt.sign({ _id: decodedPayload._id }, process.env.JWT_KEY, { expiresIn: '5m' });
          resolve(newAccesToken);
        })
        .catch((err: Error) => {
          reject(DatabaseService.rejectMessage(UNAUTHORIZED));
        });
    });
  }

  async checkIfLoggedIn(id: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      refreshModel
        .findOne({ accountId: id })
        .then((doc: Refresh) => {
          if (!doc) throw Error(UNAUTHORIZED.toString());
          resolve();
        })
        .catch((err: Error) => {
          reject(DatabaseService.rejectErrorMessage(err));
        });
    });
  }

  async logout(refreshToken: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      refreshModel
        .findOneAndDelete({ token: refreshToken })
        .then((doc: Refresh) => {
          if (!doc) throw Error(NOT_FOUND.toString());
          resolve(true);
        })
        .catch((err: Error) => {
          reject(DatabaseService.rejectErrorMessage(err));
        });
    });
  }

  async deleteAccount(id: string): Promise<Response<Account>> {
    return new Promise<Response<Account>>((resolve, reject) => {
      refreshModel
        .findOne({ accountId: id })
        .then(async (doc: Refresh) => {
          if (!doc) throw Error(NOT_FOUND.toString());
          return this.logout(doc.token);
        })
        .then((successfull: boolean) => {
          return accountModel.findByIdAndDelete(id);
        })
        .then((account: Account) => {
          resolve({ statusCode: OK, documents: account });
        })
        .catch((err: Error | ErrorMsg) => {
          reject(DatabaseService.rejectErrorMessage(err));
        });
    });
  }

  async updateAccount(id: string, body: Account): Promise<Response<Account>> {
    return new Promise<Response<Account>>((resolve, reject) => {
      this.getAccountByUsername(body.username)
        .then((account: Response<Account>) => {
          throw new Error(BAD_REQUEST.toString());
        })
        .catch(async (err: ErrorMsg) => {
          if (err.statusCode !== NOT_FOUND) throw Error();
          return this.getAccountByEmail(body.email);
        })
        .then((account: Response<Account>) => {
          throw new Error(BAD_REQUEST.toString());
        })
        .catch((err: ErrorMsg) => {
          if (err.statusCode !== NOT_FOUND) throw Error();
          return accountModel.findByIdAndUpdate(new ObjectId(id), body, { useFindAndModify: false });
        })
        .then((doc: Account) => {
          if (!doc) throw new Error(NOT_FOUND.toString());
          resolve({ statusCode: OK, documents: doc });
        })
        .catch((err: Error | ErrorMsg) => {
          reject(DatabaseService.rejectErrorMessage(err));
        });
    });
  }
}
