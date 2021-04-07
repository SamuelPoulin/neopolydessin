/* eslint-disable max-lines */
import bcrypt from 'bcrypt';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND, OK, UNAUTHORIZED } from 'http-status-codes';
import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import gameHistoryModel, { GameHistory, GameResult } from '../../models/schemas/game-history';
import { Observable } from '../utils/observable';
import { login, LoginResponse } from '../../../common/communication/login';
import { Register } from '../../../common/communication/register';
import { AccountFriend, AccountInfo, PublicAccountInfo } from '../../../common/communication/account';
import accountModel, { Account } from '../../models/schemas/account';
import avatarModel, { Avatar } from '../../models/schemas/avatar';
import loginsModel, { Logins } from '../../models/schemas/logins';
import messagesHistoryModel from '../../models/schemas/messages-history';
import refreshModel, { Refresh } from '../../models/schemas/refresh';
import * as jwtUtils from '../utils/jwt-util';
import { DashBoardInfo, GameHistoryDashBoard } from '../../../common/communication/dashboard';
import { GameType } from '../../../common/communication/lobby';
import { NotificationType } from '../../../common/socketendpoints/socket-friend-actions';

export interface Response<T> {
  statusCode: number;
  documents: T;
}

export interface ErrorMsg {
  statusCode: number;
  message: string | undefined;
}

@injectable()
export class DatabaseService {

  static FRIEND_LIST_NOTIFICATION: Observable<{ accountId: string; friends: AccountFriend[]; type: NotificationType }> = new Observable();

  static readonly CONNECTION_OPTIONS: mongoose.ConnectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  readonly SALT_ROUNDS: number = 10;

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
  }

  async getAccountById(id: string): Promise<Response<AccountInfo>> {
    return new Promise<Response<AccountInfo>>((resolve, reject) => {
      accountModel.findById(new ObjectId(id))
        .then((doc: Account) => {
          if (!doc) throw new Error(NOT_FOUND.toString());
          resolve({ statusCode: OK, documents: this.accountToAccountInfo(doc) });
        })
        .catch((err: Error) => {
          reject(DatabaseService.rejectErrorMessage(err));
        });
    });
  }

  async getDashboardById(id: string): Promise<Response<DashBoardInfo>> {
    return new Promise<Response<DashBoardInfo>>((resolve, reject) => {
      accountModel.findById(new ObjectId(id))
        .populate('logins', 'logins')
        .populate('gameHistory', 'games')
        .then((doc: Account) => {
          if (!doc) throw new Error(NOT_FOUND.toString());
          resolve({ statusCode: OK, documents: this.accountToDashBoardInfo(doc) });
        })
        .catch((err: Error) => {
          reject(DatabaseService.rejectErrorMessage(err));
        });
    });
  }


  async getPublicAccount(id: string): Promise<Response<PublicAccountInfo>> {
    return new Promise<Response<PublicAccountInfo>>((resolve, reject) => {
      try {
        accountModel.findById(new ObjectId(id))
          .then((account: Account) => {
            if (!account) throw new Error(NOT_FOUND.toString());
            resolve({ statusCode: OK, documents: this.accountToPublicAccountInfo(account) });
          })
          .catch((err: Error) => {
            reject(DatabaseService.rejectErrorMessage(err));
          });
      } catch {
        reject(DatabaseService.rejectErrorMessage(new Error(NOT_FOUND.toString())));
      }
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

  async createAccount(body: Register): Promise<Response<LoginResponse>> {
    return new Promise<Response<LoginResponse>>((resolve, reject) => {
      const account = {
        firstName: body.firstName,
        lastName: body.lastName,
        username: body.username,
        email: body.email,
        password: body.password,
      } as Account;
      const model = new accountModel(account);
      let loginsModelId: string;
      this.getAccountByUsername(account.username)
        .then(async (found: Response<Account>) => {
          throw Error(BAD_REQUEST.toString());
        })
        .catch(async (err: ErrorMsg) => {
          if (err.statusCode !== NOT_FOUND) throw err;
          return this.getAccountByEmail(account.email);
        })
        .then(async (found: Response<Account>) => {
          throw Error(BAD_REQUEST.toString());
        })
        .catch(async (err: ErrorMsg) => {
          if (err.statusCode !== NOT_FOUND) throw err;
          const logins = new loginsModel({
            accountId: model._id, logins: []
          });
          return logins.save();
        })
        .then(async (logins: Logins) => {
          loginsModelId = logins._id.toHexString();
          return avatarModel.addAvatarDocument(model._id.toHexString());
        })
        .then( async (result: Avatar) => {
          model.avatar = result._id.toHexString();
          const gameHistory = new gameHistoryModel({
            accountId: model._id, games: []
          });
          return gameHistory.save();
        })
        .then(async (gameHistory: GameHistory) => {
          model.gameHistory = gameHistory._id.toHexString();
          return bcrypt.hash(model.password, this.SALT_ROUNDS);
        })
        .then(async (hash) => {
          model.password = hash;
          model.logins = loginsModelId;
          return model.save();
        })
        .then(async (acc: Account) => {
          return this.login({ username: body.username, password: body.password });
        })
        .then((tokens: Response<LoginResponse>) => {
          resolve(tokens);
        })
        .catch((err: Error) => {
          reject(DatabaseService.rejectErrorMessage(err));
        });
    });
  }

  async login(loginInfo: login): Promise<Response<LoginResponse>> {
    return new Promise<Response<LoginResponse>>((resolve, reject) => {
      let account: Account;
      let jwtToken: string;
      let jwtRefreshToken: string;
      let friends: AccountFriend[];
      this.getAccountByUsername(loginInfo.username)
        .then(async (results: Response<Account>) => {
          account = results.documents;
          friends = account.friends;
          return bcrypt.compare(loginInfo.password, account.password);
        })
        .then((match) => {
          if (!match) throw Error(UNAUTHORIZED.toString());
          jwtToken = jwtUtils.encodeAccessToken({ _id: account._id });
          jwtRefreshToken = jwtUtils.encodeRefreshToken({ _id: account._id });
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
          DatabaseService.FRIEND_LIST_NOTIFICATION.notify({ accountId: account.id, friends, type: NotificationType.userConnected });
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
          if (!doc) throw Error();
          const decodedPayload = jwtUtils.decodeRefreshToken(doc.token);
          const newAccesToken = jwtUtils.encodeAccessToken({ _id: decodedPayload });
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
        .then(async (doc: Refresh) => {
          if (!doc) throw Error(NOT_FOUND.toString());
          return this.getAccountById(doc.accountId);
        })
        .then((account) => {
          DatabaseService.FRIEND_LIST_NOTIFICATION.notify({
            accountId: account.documents._id,
            friends: account.documents.friends,
            type: NotificationType.userDisconnected,
          });
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
          return loginsModel.findByAccountIdAndDelete(id);
        })
        .then((logins: Logins) => {
          return messagesHistoryModel.removeHistoryOfAccount(id);
        })
        .then((result) => {
          return avatarModel.removeAvatar(id);
        })
        .then((result) => {
          return gameHistoryModel.findOneAndDelete( { accountId: id});
        })
        .then((result) => {
          return accountModel.findByIdAndDelete(id);
        })
        .then((account: Account) => {
          DatabaseService.FRIEND_LIST_NOTIFICATION.notify({
            accountId: account.id,
            friends: account.friends,
            type: NotificationType.userUpdatedAccount
          });
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
          if (err.statusCode !== NOT_FOUND) throw err;
          return this.getAccountByEmail(body.email);
        })
        .then((account: Response<Account>) => {
          throw new Error(BAD_REQUEST.toString());
        })
        .catch((err: ErrorMsg) => {
          if (err.statusCode !== NOT_FOUND) throw err;
          return accountModel.findByIdAndUpdate(new ObjectId(id), body, { useFindAndModify: false });
        })
        .then((doc: Account) => {
          if (!doc) throw new Error(NOT_FOUND.toString());
          DatabaseService.FRIEND_LIST_NOTIFICATION.notify({
            accountId: doc.id,
            friends: doc.friends,
            type: NotificationType.userUpdatedAccount
          });
          resolve({ statusCode: OK, documents: doc });
        })
        .catch((err: Error | ErrorMsg) => {
          reject(DatabaseService.rejectErrorMessage(err));
        });
    });
  }

  private accountToAccountInfo(account: Account): AccountInfo {
    return {
      _id: account.id,
      firstName: account.firstName,
      lastName: account.lastName,
      username: account.username,
      email: account.email,
      friends: account.friends,
      createdDate: account.createdDate,
      avatar: account.avatar,
    };
  }

  private accountToPublicAccountInfo(account: Account): PublicAccountInfo {
    return {
      accountId: account.id,
      username: account.username,
      avatar: account.avatar
    };
  }

  private accountToDashBoardInfo(account: Account): DashBoardInfo {
    return {
      _id: account.id,
      firstName: account.firstName,
      lastName: account.lastName,
      username: account.username,
      email: account.email,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      logins: account.logins as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      gameHistory: this.gameHistoryToGameHistoryDashBoard(account.gameHistory as any),
      createdDate: account.createdDate,
      avatar: account.avatar,
    };
  }

  private gameHistoryToGameHistoryDashBoard(gameHistory: GameHistory): GameHistoryDashBoard {
    let timePlayed: number = 0;
    let nbWin: number = 0;
    let classiqueGamePlayed: number = 0;
    let bestCoopScore: number = 0;
    let bestSoloScore: number = 0;
    let averageTimePerGame: number = 0;
    let winRate: number = 0;
    gameHistory.games.forEach((game) => {
      switch (game.gameType) {
        case GameType.CLASSIC: {
          if (game.gameResult === GameResult.WIN) {
            nbWin++;
          }
          classiqueGamePlayed++;
          break;
        }
        case GameType.SPRINT_SOLO: {
          if (game.team[0].score > bestSoloScore) {
            bestSoloScore = game.team[0].score;
          }
          break;
        }
        case GameType.SPRINT_COOP: {
          if (game.team[0].score > bestCoopScore) {
            bestCoopScore = game.team[0].score;
          }
          break;
        }
        default: {
          break;
        }
      }
      timePlayed += this.calculateGameTime(game.startDate, game.endDate);
    });
    if (gameHistory.games.length > 0) {
      averageTimePerGame = timePlayed / gameHistory.games.length;
    }
    if (classiqueGamePlayed > 0) {
      winRate = nbWin / classiqueGamePlayed;
    }
    return {
      games: gameHistory.games,
      nbGamePlayed: gameHistory.games.length,
      winPercentage: winRate,
      averageGameTime: averageTimePerGame,
      totalTimePlayed: timePlayed,
      bestScoreSolo: bestSoloScore,
      bestScoreCoop: bestCoopScore,
    };
  }

  private calculateGameTime(startTime: number, endTime: number): number {
    return endTime - startTime;
  }
}
