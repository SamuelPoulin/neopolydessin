package com.projet.clientleger.data.api.model.lobby

import android.os.Parcelable
import com.projet.clientleger.data.api.model.lobby.Player
import com.projet.clientleger.data.enumData.Difficulty
import com.projet.clientleger.data.enumData.GameType
import com.projet.clientleger.data.model.lobby.LobbyInfo
import kotlinx.android.parcel.Parcelize
import kotlinx.serialization.Serializable

@Serializable
@Parcelize
data class Lobby(val lobbyId: String,
                 val lobbyName: String,
                 val ownerUsername: String,
                 val nbPlayerInLobby: Int,
                 val gameType: String,
                 val difficulty: String,
                 val maxSize: Int,
                 val private: Boolean) : Parcelable {
    fun toInfo(): LobbyInfo {
        return LobbyInfo(lobbyId,
                lobbyName,
                ownerUsername,
                nbPlayerInLobby,
                GameType.stringToEnum(gameType),
                Difficulty.stringToEnum(difficulty),
                maxSize,
                private)
    }
}
