package com.projet.clientleger.data.model.lobby

import android.graphics.Bitmap
import com.projet.clientleger.data.enumData.GameRole

data class PlayerInfo(val accountId: String = "",
                      val username: String = "",
                      var avatar: Bitmap? = null,
                      val playerStatus: GameRole = GameRole.PASSIVE,
                      val teamNumber: Int = 0,
                      val isBot: Boolean = false,
                      val finishedLoading: Boolean = false)
