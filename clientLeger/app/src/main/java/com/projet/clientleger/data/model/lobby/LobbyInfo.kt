package com.projet.clientleger.data.model.lobby

import android.os.Parcelable
import com.projet.clientleger.data.enumData.Difficulty
import com.projet.clientleger.data.enumData.GameType
import kotlinx.android.parcel.Parcelize
import kotlinx.serialization.Serializable

@Serializable
@Parcelize
data class LobbyInfo(val lobbyId: String = "",
                     val lobbyName: String = "",
                     val ownerUsername: String = "",
                     val nbPlayerInLobby: Int = 0,
                     val gameType: GameType = GameType.CLASSIC,
                     val difficulty: Difficulty = Difficulty.EASY,
                     val maxSize: Int = 0,
                     val isPrivate: Boolean = false) : Parcelable