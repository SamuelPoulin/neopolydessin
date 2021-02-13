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
        // tslint:disable-next-line:no-non-null-assertion
        return this.socketIdNameMap.get(socketId)!;
    }
}
