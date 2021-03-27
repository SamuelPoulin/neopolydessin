package com.projet.clientleger.data.endpoint

enum class LobbySocketEndpoints(val value: String) {
    CREATE_LOBBY("createLobby"),
    RECEIVE_LOBBY_INFO("receiveLobbyInfo"),
    JOIN_LOBBY("joinLobby"),
    START_GAME("StartGameFromLobbyToServer"),
    RECEIVE_START_GAME("StartGameFromServerToClient"),
}