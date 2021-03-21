export enum SocketMessages {
    SEND_MESSAGE = 'SendMsg',
    SEND_PRIVATE_MESSAGE = 'SendPrivateMsg',
    RECEIVE_MESSAGE = 'ReceiveMsg',
    RECEIVE_PRIVATE_MESSAGE = 'ReceivePrivateMsg',
    PLAYER_CONNECTION = 'PlayerConnected',
    PLAYER_DISCONNECTION = 'PlayerDisconnected',
    START_GAME_SERVER = 'StartGameFromLobbyToServer',
    START_GAME_CLIENT = 'StartGameFromServerToClient',
    CREATE_LOBBY = 'CreateLobby',
    GET_ALL_LOBBIES = 'GetListLobby',
    PLAYER_GUESS = 'PlayerGuessWord',
    SET_GAME_PRIVACY = 'ChangePrivacySetting',
    EMIT_NEW_PRIVACY_SETTING = 'EmitPrivacySetting',
    RECEIVE_LOBBY_INFO = 'ReceiveLobbyInfo',
    END_GAME = 'EndCurrentGame',
    SET_TIME = 'SetTime'
}
