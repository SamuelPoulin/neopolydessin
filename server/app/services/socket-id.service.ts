
import { injectable } from 'inversify';
import * as jwtUtils from '../utils/jwt-util';

@injectable()
export class SocketIdService {
  accountIdsocketIdMap: Map<string, string>;

  constructor() {
    this.accountIdsocketIdMap = new Map<string, string>();
  }

  AssociateAccountIdToSocketId(accessToken: string, socketId: string): void {
    const decodedPayload = jwtUtils.decodeAccessToken(accessToken);
    this.accountIdsocketIdMap.set(decodedPayload, socketId);
  }

  DisconnectAccountIdSocketId(socketId: string): void {
    const accountId = Object.keys(this.accountIdsocketIdMap).find((keyValue) => this.accountIdsocketIdMap[keyValue] === socketId);
    if (accountId) {
      this.accountIdsocketIdMap.delete(accountId);
    }
  }

  GetSocketIdOfAccountId(accountId: string): string | undefined {
    return this.accountIdsocketIdMap.get(accountId);
  }

  GetAccountIdOfSocketId(socketId: string): string | undefined {
    return Object.keys(this.accountIdsocketIdMap).find((keyValue) => this.accountIdsocketIdMap[keyValue] === socketId);
  }
}
