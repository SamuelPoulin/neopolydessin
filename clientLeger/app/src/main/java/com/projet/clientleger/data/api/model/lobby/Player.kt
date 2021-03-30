package com.projet.clientleger.data.api.model.lobby

import android.graphics.Bitmap
import android.os.Parcelable
import com.projet.clientleger.data.model.lobby.PlayerInfo
import kotlinx.android.parcel.Parcelize
import kotlinx.serialization.Serializable

@Serializable
@Parcelize
data class Player(val teamNumber: Int = 0,
                  val playerName: String = "",
                  val accountId: String = "",
                  val avatar: String? = "") : Parcelable {
    fun toPlayerInfo(avatarBitmap: Bitmap?): PlayerInfo {
        return if(avatarBitmap == null)
            PlayerInfo(teamNumber, playerName, accountId)
        else
            PlayerInfo(teamNumber, playerName, accountId, avatarBitmap!!)
    }
}
