export enum SocketLobby {
    CREATE_LOBBY = 'createLobby',
    GET_ALL_LOBBIES = 'getListLobby',
    RECEIVE_LOBBY_INFO = 'receiveLobbyInfo',
    UPDATE_LOBBIES = 'updateLobbies',

    JOIN_LOBBY = 'joinLobby',
    LEAVE_LOBBY = 'leaveLobby',

    ADD_BOT = 'addBot',
    REMOVE_BOT = 'removeBot',
    REMOVE_PLAYER = 'removePlayer',
    PLAYER_REMOVED = 'playerRemoved',

    CHANGE_PRIVACY_SETTING = 'privacySetting',
    CHANGED_PRIVACY_SETTING = 'changedPrivacy',

    START_GAME_SERVER = 'StartGameFromLobbyToServer',
    START_GAME_CLIENT = 'StartGameFromServerToClient',

    PLAYER_GUESS = 'guess',
    LOADING_OVER = 'loadingOver',

    END_GAME = 'endGame',
    SET_TIME = 'setTime',

    UPDATE_ROLES = 'updateRoles',
    UPDATE_WORD_TO_DRAW = 'updateWordToDraw',
    UPDATE_TEAMS_SCORE = 'updateTeamsScore',
    UPDATE_GAME_STATE = 'updateGameState',

    SOLO_COOP_GUESS_BROADCAST = 'soloCoopGuessBroadcast',
    CLASSIQUE_GUESS_BROADCAST = 'classiqueGuessBroadcast'
}