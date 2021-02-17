export enum SocketConnection {
    CONNECTION = 'connection',
    DISCONNECTION = 'disconnect',
    PLAYER_CONNECTION = 'newPlayer',
    VALID_USERNAME = 'usernameValid',
    INVALID_USERNAME = 'usernameTaken',
}

export interface PlayerConnectionResult {
    status: string;
}

export enum PlayerConnectionStatus {
    VALID = 'Valid',
    INVALID = 'Invalid'
}