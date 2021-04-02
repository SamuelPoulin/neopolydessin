package com.projet.clientleger.data.api.model.lobby

import android.os.Parcelable
import com.projet.clientleger.data.api.model.lobby.Player
import com.projet.clientleger.data.enumData.Difficulty
import kotlinx.android.parcel.Parcelize
import kotlinx.serialization.Serializable

@Serializable
@Parcelize
data class Lobby(val lobbyId:String,
                 val lobbyName:String,
                 val ownerUsername:String,
                 val nbPlayerInLobby:Int,
                 val gameType:String,
                 val difficulty: String,
                 val maxSize: Int) : Parcelable
