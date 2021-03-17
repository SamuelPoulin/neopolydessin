package com.projet.clientleger.data.model
import kotlinx.serialization.Serializable

@Serializable
data class GameInfo(val lobbyid:String,val lobbyName: String, val lobbyOwner: String, val gameMode: String, val gameCapacity: String) {
    override fun toString(): String {
        return "Lobby ID: $lobbyid, Lobby Name: $lobbyName, Lobby Owner: $lobbyOwner, Game Mode: $gameMode, Game Capacity: $gameCapacity"
    }
}