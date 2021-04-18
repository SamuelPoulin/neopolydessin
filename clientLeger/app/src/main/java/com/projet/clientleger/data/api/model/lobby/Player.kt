package com.projet.clientleger.data.api.model.lobby

import android.graphics.Bitmap
import android.os.Parcelable
import com.projet.clientleger.data.enumData.PlayerRole
import com.projet.clientleger.data.model.lobby.PlayerInfo
import kotlinx.android.parcel.Parcelize
import kotlinx.serialization.Serializable

@Serializable
@Parcelize
data class Player(var accountId: String? = "",
                  val username: String = "",
                  val avatarId: String? = "",
                  val playerRole: String = "",
                  val teamNumber: Int = 0,
                  val isBot: Boolean = false,
                  val isOwner: Boolean = false,
                  var finishedLoading: Boolean? = false) : Parcelable {
    fun toPlayerInfo(avatarBitmap: Bitmap?): PlayerInfo {
        if(accountId == null)
            accountId = ""
        if(finishedLoading == null)
            finishedLoading = true
        return PlayerInfo(accountId!!, username,
                avatarBitmap, avatarId, PlayerRole.stringToRole(playerRole),
                teamNumber, isBot, isOwner, finishedLoading!!)
    }
}
