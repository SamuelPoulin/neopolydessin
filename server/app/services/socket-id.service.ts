/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { injectable } from 'inversify';

@injectable()
export class SocketIdService {
  accountIdsocketIdMap: Map<string, string>;

  constructor() {
    this.accountIdsocketIdMap = new Map<string, string>();
  }

  AssociateAccountIdToSocketId(accountId: string, socketId: string): void {
    this.accountIdsocketIdMap.set(accountId, socketId);
  }

  DisconnectAccountIdSocketId(socketId: string): void {
    // eslint-disable-next-line max-len
    // const accountId = Object.getOwnPropertyNames(this.accountIdsocketIdMap).find((keyValue) => this.accountIdsocketIdMap[keyValue] === socketId);

    for (const [key, value] of this.accountIdsocketIdMap.entries()) {
      if (value === socketId) {
        this.accountIdsocketIdMap.delete(key);
      }
    }

    /* if (accountId) {
      this.accountIdsocketIdMap.delete(accountId);
      console.log(this.accountIdsocketIdMap.get('accountId2'));
    }*/
  }

  GetSocketIdOfAccountId(accountId: string): string {
    return this.accountIdsocketIdMap.get(accountId)!;
  }

  GetAccountIdOfSocketId(socketId: string): string | undefined {
    // return Object.keys(this.accountIdsocketIdMap).find((keyValue) => this.accountIdsocketIdMap[keyValue] === socketId);

    for (const [key, value] of this.accountIdsocketIdMap.entries()) {
      if (value === socketId) {
        return key;
      }
    }
    return undefined;
  }
}
