export enum SocketConnection {
    CONNECTION = 'connection',
    DISCONNECTION = 'disconnect',
    DISCONNECTING = 'disconnecting',
}

export interface PlayerConnectionResult {
    status: string;
}

export enum PlayerConnectionStatus {
    VALID = 'Valid',
    INVALID = 'Invalid'
}