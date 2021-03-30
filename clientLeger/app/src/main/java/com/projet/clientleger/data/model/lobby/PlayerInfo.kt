package com.projet.clientleger.data.model.lobby

import android.graphics.Bitmap

data class PlayerInfo(val teamNumber: Int = 0,
                      val username: String = "",
                      val accountId: String = "",
                      var avatar: Bitmap? = Bitmap.createBitmap(1, 1, Bitmap.Config.RGB_565))
