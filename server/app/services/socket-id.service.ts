import { injectable } from 'inversify';

@injectable()
export class SocketIdService {
  socketIdNameMap: Map<string, string>;

  constructor() {
    this.socketIdNameMap = new Map<string, string>();
  }

  AssociateSocketIdName(socketId: string, name: string): void {
    this.socketIdNameMap.set(socketId, name);
  }

  DisconnectSocketIdName(socketId: string): void {
    this.socketIdNameMap.delete(socketId);
  }

  GetNameOfSocketId(socketId: string): string {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.socketIdNameMap.get(socketId)!;
  }

  GetSocketIdOfName(playerName: string): string | undefined {
    return Object.keys(this.socketIdNameMap).find((keyValue) => this.socketIdNameMap[keyValue] === playerName);
  }
}
