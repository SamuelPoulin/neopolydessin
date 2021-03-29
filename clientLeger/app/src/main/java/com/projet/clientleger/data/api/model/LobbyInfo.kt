package com.projet.clientleger.data.api.model

import android.os.Parcelable
import com.projet.clientleger.data.api.model.lobby.Player
import kotlinx.android.parcel.Parcelize
import kotlinx.serialization.Serializable

@Serializable
@Parcelize
data class LobbyInfo(val lobbyId:String, val lobbyName:String, val ownerUsername:String, val playerInfo:List<Player>, val gameType:String) : Parcelable{
}
