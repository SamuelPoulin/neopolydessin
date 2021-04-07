package com.projet.clientleger.data.repository

import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.http.ApiDashboardInterface
import com.projet.clientleger.data.api.model.account.Account
import com.projet.clientleger.data.api.model.account.FriendInfo
import javax.inject.Inject
import javax.net.ssl.HttpsURLConnection

open class AccountManagementRepository @Inject constructor(private val apiDashboardInterface: ApiDashboardInterface, private val sessionManager: SessionManager){
    open suspend fun getAccountInfos():Account? {
        var account:Account? = Account("","","","","",ArrayList<FriendInfo>(), 0,"")
        val res = apiDashboardInterface.getAccount()
        if(res.code() == HttpsURLConnection.HTTP_OK)
            account = res.body()
        return account
    }
}