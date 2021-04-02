package com.projet.clientleger.data.model.lobby

import android.os.Parcelable
import com.projet.clientleger.data.enumData.Difficulty
import com.projet.clientleger.data.enumData.GameType
import kotlinx.android.parcel.Parcelize
import kotlinx.serialization.Serializable

@Serializable
@Parcelize
data class Lobby(val lobbyId:String,
                 val lobbyName:String,
                 val ownerUsername:String,
                 val nbPlayerInLobby:Int,
                 val gameType: GameType,
                 val difficulty: Difficulty,
                 val maxSize: Int) : Parcelable