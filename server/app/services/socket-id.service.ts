/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { injectable } from 'inversify';
import * as jwt from 'jsonwebtoken';

interface AccessToken {
  _id: string;
  iat: number;
  exp: number;
}

@injectable()
export class SocketIdService {
  accountIdsocketIdMap: Map<string, string>;

  constructor() {
    this.accountIdsocketIdMap = new Map<string, string>();
  }

  AssociateAccountIdToSocketId(accessToken: string, socketId: string): void {
    if (process.env.JWT_REFRESH_KEY) {
      const decodedPayload: AccessToken = jwt.verify(accessToken, process.env.JWT_REFRESH_KEY) as AccessToken;
      this.accountIdsocketIdMap.set(decodedPayload._id, socketId);
    }
  }

  DisconnectAccountIdSocketId(socketId: string): void {
    const accountId = Object.keys(this.accountIdsocketIdMap).find((keyValue) => this.accountIdsocketIdMap[keyValue] === socketId);
    if (accountId) {
      this.accountIdsocketIdMap.delete(accountId);
    }
  }

  GetSocketIdOfAccountId(accountId: string): string {
    return this.accountIdsocketIdMap.get(accountId)!;
  }

  GetAccountIdOfSocketId(socketId: string): string | undefined {
    return Object.keys(this.accountIdsocketIdMap).find((keyValue) => this.accountIdsocketIdMap[keyValue] === socketId);
  }
}
