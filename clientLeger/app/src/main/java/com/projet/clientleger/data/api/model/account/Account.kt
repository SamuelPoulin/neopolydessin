package com.projet.clientleger.data.api.model.account

import android.graphics.Bitmap
import com.projet.clientleger.data.model.account.AccountInfo
import com.projet.clientleger.utils.DateFormatter
import kotlinx.serialization.Serializable
import java.text.SimpleDateFormat
import java.util.*
import kotlin.collections.ArrayList

@Serializable
data class Account(val _id: String,
                   val firstName: String,
                   val lastName: String,
                   val username: String,
                   val email: String,
                   val friends: ArrayList<FriendInfo>,
                   val createdDate: Long,
                   val avatar: String){
    fun toAccountInfo(avatarBitMap: Bitmap?): AccountInfo{
        return if(avatarBitMap == null){
            AccountInfo(_id,
                    firstName,
                    lastName,
                    username,
                    email,
                    Date(createdDate))
        }
        else{
            AccountInfo(_id,
                    firstName,
                    lastName,
                    username,
                    email,
                    Date(createdDate),
                    avatarBitMap)
        }
    }
}
