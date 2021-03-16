package com.projet.clientleger.data.model
import kotlinx.serialization.Serializable

@Serializable
data class GameInfo(override var lobbyid:String, override var lobbyName: String, override var lobbyOwner: String, override var gameMode: String, override var gameCapacity: String): IGameInfo {
    override fun toString(): String {
        return "Lobby ID: $lobbyid, Lobby Name: $lobbyName, Lobby Owner: $lobbyOwner, Game Mode: $gameMode, Game Capacity: $gameCapacity"
    }
}