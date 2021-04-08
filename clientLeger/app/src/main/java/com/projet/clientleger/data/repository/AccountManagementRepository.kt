package com.projet.clientleger.data.repository

import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.http.ApiDashboardInterface
import com.projet.clientleger.data.api.model.account.*
import com.projet.clientleger.data.model.account.UpdateAccountModel
import javax.inject.Inject
import javax.net.ssl.HttpsURLConnection

open class AccountManagementRepository @Inject constructor(private val apiDashboardInterface: ApiDashboardInterface, private val sessionManager: SessionManager){
    open suspend fun getAccountInfos():AccountDashboard? {
        val res = apiDashboardInterface.getAccount()
        val accountDashboard:AccountDashboard? = res.body()
        println(res.body())
        println(accountDashboard)
        return accountDashboard
    }
    open suspend fun updateAccountInfos(account:UpdateAccountModel):Account?{
        var returnAccount:Account? = Account("","","","","",ArrayList<FriendInfo>(), 0,"")
        val res = apiDashboardInterface.updateAccount(account)
        if(res.code() == HttpsURLConnection.HTTP_OK)
            returnAccount = res.body()
        return returnAccount
    }
}