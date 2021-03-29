package com.projet.clientleger.data.model.lobby

import android.graphics.Bitmap

data class PlayerInfo(val teamNumber: Int = 0,
                      val playerName: String = "",
                      val accountId: String = "",
                      val avatar: Bitmap = Bitmap.createBitmap(0, 0, Bitmap.Config.RGB_565))
