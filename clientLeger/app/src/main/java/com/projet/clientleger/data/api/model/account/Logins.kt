package com.projet.clientleger.data.api.model.account

import com.projet.clientleger.data.model.account.LoginInfo
import kotlinx.serialization.Serializable

@Serializable
data class Logins(val _id: String, val logins: ArrayList<Login>){
    fun toLoginList(): ArrayList<LoginInfo>{
        val list = ArrayList<LoginInfo>()
        for(login in logins)
            list.add(login.toLoginInfo())
        return list
    }
}
