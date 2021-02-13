import { injectable } from 'inversify';

@injectable()
export class SocketIdService {
    socketIdNameMap: Map<string, string>;

    constructor() {
        this.socketIdNameMap = new Map();
    }

    public AssociateSocketIdName(socketId: string, name: string): void {
        this.socketIdNameMap.set(socketId, name);
    }

    public DisconnectSocketIdName(socketId: string): void {
        this.socketIdNameMap.delete(socketId);
    }

    public GetNameOfSocketId(socketId: string): string {
        return this.socketIdNameMap.get(socketId)!;
    }
}