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
    const accountId = this.GetAccountIdOfSocketId(socketId);
    if (accountId) {
      this.accountIdsocketIdMap.delete(accountId);
    }

    /* if (accountId) {
      this.accountIdsocketIdMap.delete(accountId);
      console.log(this.accountIdsocketIdMap.get('accountId2'));
    }*/
  }

  GetSocketIdOfAccountId(accountId: string): string | undefined {
    return this.accountIdsocketIdMap.get(accountId);
  }

  GetAccountIdOfSocketId(socketId: string): string | undefined {
    return Array.from(this.accountIdsocketIdMap.keys()).find((keyValue) => this.accountIdsocketIdMap.get(keyValue) === socketId);
  }
}
