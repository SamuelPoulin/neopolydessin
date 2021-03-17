package com.projet.clientleger.data.api.model

import com.projet.clientleger.data.model.PlayerInfo
import kotlinx.serialization.Serializable

@Serializable
data class LobbyInfo(val lobbyId:String, val playerInfo:List<PlayerInfo>, val gameType:String) {
}
