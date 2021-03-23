package com.projet.clientleger.data.enum

enum class LobbySocketEndpoints(val value: String) {
    RECEIVE_LOBBY_INFO("ReceiveLobbyInfo"),
    JOIN_LOBBY("newPlayer"),
    START_GAME("StartGameFromLobbyToServer"),
    RECEIVE_START_GAME("StartGameFromServerToClient"),
}