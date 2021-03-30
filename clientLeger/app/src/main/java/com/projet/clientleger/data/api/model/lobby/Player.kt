package com.projet.clientleger.data.api.model.lobby

import android.graphics.Bitmap
import android.os.Parcelable
import com.projet.clientleger.data.enumData.GameRole
import com.projet.clientleger.data.model.lobby.PlayerInfo
import kotlinx.android.parcel.Parcelize
import kotlinx.serialization.Serializable

@Serializable
@Parcelize
data class Player(val accountId: String = "",
                  val username: String = "",
                  val avatarId: String = "",
                  val playerStatus: String = "",
                  val teamNumber: Int = 0,
                  val isBot: Boolean = false,
                  val finishedLoading: Boolean = false) : Parcelable {
    fun toPlayerInfo(avatarBitmap: Bitmap?): PlayerInfo {
        return PlayerInfo(accountId, username,
                avatarBitmap, GameRole.stringToRole(playerStatus),
                teamNumber, isBot, finishedLoading)
    }
}
