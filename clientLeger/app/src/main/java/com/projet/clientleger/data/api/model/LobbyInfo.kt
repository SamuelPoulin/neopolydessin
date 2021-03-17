package com.projet.clientleger.data.api.model

import android.os.Parcelable
import com.projet.clientleger.data.model.PlayerInfo
import kotlinx.android.parcel.Parcelize
import kotlinx.serialization.Serializable

@Serializable
@Parcelize
data class LobbyInfo(val lobbyId:String, val playerInfo:List<PlayerInfo>, val gameType:String) : Parcelable{
}
