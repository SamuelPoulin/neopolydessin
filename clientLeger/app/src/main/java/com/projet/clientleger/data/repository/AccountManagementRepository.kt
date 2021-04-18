package com.projet.clientleger.data.repository

import android.graphics.Bitmap
import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.http.ApiDashboardInterface
import com.projet.clientleger.data.api.model.account.*
import com.projet.clientleger.data.model.account.UpdateAccountModel
import okhttp3.RequestBody
import javax.inject.Inject
import javax.net.ssl.HttpsURLConnection

open class AccountManagementRepository @Inject constructor(private val apiDashboardInterface: ApiDashboardInterface, private val sessionManager: SessionManager){
    open suspend fun getAccountInfos():AccountDashboard? {
        val res = apiDashboardInterface.getAccount()
        return res.body()
    }
    open suspend fun updateAccountInfos(account:UpdateAccountModel){
        apiDashboardInterface.updateAccount(account)
    }
    open suspend fun updateAvatar(image:RequestBody){
        apiDashboardInterface.uploadAvatar(image)
    }
}