package com.projet.clientleger.data.model.lobby

import android.graphics.Bitmap
import com.projet.clientleger.data.enumData.PlayerRole

data class PlayerInfo(val accountId: String = "",
                      val username: String = "",
                      var avatar: Bitmap? = null,
                      val avatarId: String? = null,
                      val playerRole: PlayerRole = PlayerRole.PASSIVE,
                      val teamNumber: Int = 0,
                      val isBot: Boolean = false,
                      val isOwner: Boolean = false,
                      val finishedLoading: Boolean = false)
