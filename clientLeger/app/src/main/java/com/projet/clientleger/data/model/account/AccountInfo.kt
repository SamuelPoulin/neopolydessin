package com.projet.clientleger.data.model.account

import android.graphics.Bitmap
import com.projet.clientleger.utils.DateFormatter
import java.nio.Buffer
import java.util.*
import kotlin.collections.ArrayList

data class AccountInfo(val accountId: String = "",
                       val firstName: String = "",
                       val lastName: String = "",
                       val username: String = "",
                       val email: String = "",
                       val createdDate: Date = DateFormatter.now(),
                       val avatar: Bitmap= Bitmap.createBitmap(1, 1, Bitmap.Config.RGBA_F16))
