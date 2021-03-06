package com.projet.clientleger.data.endpoint

enum class GameSocketEndPoints(val value:String) {
    PLAYER_GUESS("guess"),
    RECEIVE_WORD_GUESS("updateWordToDraw"),
    SET_TIME("setTime"),
    RECEIVE_ROLES("updateRoles"),
    PLAYER_READY("loadingOver"),
    END_GAME_TRIGGER("endGame"),
    RECEIVE_TEAM_SCORES("updateTeamsScore"),
    UPDATE_GAME_STATE("updateGameState"),
    ON_LEAVE("leaveLobby")
}