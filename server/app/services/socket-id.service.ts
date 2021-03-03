import { injectable } from 'inversify';

@injectable()
export class SocketIdService {
  accountIdsocketIdMap: Map<string, string>;
  socketIdGameRoomMap: Map<string, string>;

  constructor() {
    this.accountIdsocketIdMap = new Map<string, string>();
    this.socketIdGameRoomMap = new Map<string, string>();
  }

  AssociateAccountIdToSocketId(accountId: string, socketId: string): void {
    this.accountIdsocketIdMap.set(accountId, socketId);
  }

  DisconnectAccountIdSocketId(socketId: string): void {
    const accountId = this.GetAccountIdOfSocketId(socketId);
    if (accountId) {
      this.accountIdsocketIdMap.delete(accountId);
    }
  }

  GetSocketIdOfAccountId(accountId: string): string | undefined {
    return this.accountIdsocketIdMap.get(accountId);
  }

  GetAccountIdOfSocketId(socketId: string): string | undefined {
    return Array.from(this.accountIdsocketIdMap.keys()).find((keyValue) => this.accountIdsocketIdMap.get(keyValue) === socketId);
  }

  AssociateSocketToLobby(socketId: string, lobbyId: string): void {
    this.socketIdGameRoomMap.set(socketId, lobbyId);
  }

  GetCurrentLobbyOfSocket(socketId: string): string | undefined {
    return this.socketIdGameRoomMap.get(socketId);
  }

  DisconnectSocketFromLobby(socketId: string): void {
    this.socketIdGameRoomMap.delete(socketId);
  }

  RemoveAllPlayersFromLobby(lobbyId: string): void {
    for(const key of Array.from(this.socketIdGameRoomMap.keys())) {
      if (this.socketIdGameRoomMap.get(key) === lobbyId) {
        this.socketIdGameRoomMap.delete(key);
      }
    }
  }
}
