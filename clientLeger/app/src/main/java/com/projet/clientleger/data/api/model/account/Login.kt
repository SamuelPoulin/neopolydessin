package com.projet.clientleger.data.api.model.account

import com.projet.clientleger.data.model.account.LoginInfo
import com.projet.clientleger.utils.DateFormatter
import kotlinx.serialization.Serializable

@Serializable
data class Login(val _id: String, val start: String, val end: String){
    fun toLoginInfo(): LoginInfo{
        return LoginInfo(DateFormatter.stringToDate(start), DateFormatter.stringToDate(end))
    }
}
