export enum SocketLobby {
    CREATE_LOBBY = 'createLobby',
    GET_ALL_LOBBIES = 'getListLobby',
    RECEIVE_LOBBY_INFO = 'receiveLobbyInfo',

    JOIN_LOBBY = 'joinLobby',
    LEAVE_LOBBY = 'leaveLobby',

    CHANGE_PRIVACY_SETTING = 'privacySetting',
    CHANGED_PRIVACY_SETTING = 'changedPrivacy',

    START_GAME_SERVER = 'StartGameFromLobbyToServer',
    START_GAME_CLIENT = 'StartGameFromServerToClient',

    PLAYER_GUESS = 'guess',

    END_GAME = 'endGame',
    SET_TIME = 'setTime'
}