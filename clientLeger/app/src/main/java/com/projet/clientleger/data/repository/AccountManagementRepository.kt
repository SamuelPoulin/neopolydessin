package com.projet.clientleger.data.repository

import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.http.ApiDashboardInterface
import com.projet.clientleger.data.api.model.account.*
import com.projet.clientleger.data.model.account.UpdateAccountModel
import io.reactivex.rxjava3.annotations.NonNull
import io.reactivex.rxjava3.core.Observable
import kotlinx.serialization.json.JsonObject
import okhttp3.MultipartBody
import okhttp3.ResponseBody
import org.json.JSONObject
import retrofit2.Call
import javax.inject.Inject
import retrofit2.Callback
import retrofit2.Response
import javax.net.ssl.HttpsURLConnection

open class AccountManagementRepository @Inject constructor(private val apiDashboardInterface: ApiDashboardInterface, private val sessionManager: SessionManager) {
    open suspend fun getAccountInfos(): AccountDashboard? {
        val res = sessionManager.request(apiDashboardInterface::getAccount)
        return if (res.code() == HttpsURLConnection.HTTP_OK) res.body()!! else null
    }

    open suspend fun updateAccountInfos(account: UpdateAccountModel) {
        sessionManager.request(account, apiDashboardInterface::updateAccount)
    }

    open suspend fun updateAvatar(image: MultipartBody.Part): String? {
        val res = sessionManager.request(image, apiDashboardInterface::uploadAvatar)
        var errorMsg: String? = null
        if (res.code() == HttpsURLConnection.HTTP_OK)
            sessionManager.refreshAccountInfo()
        else
            errorMsg = "Erreur lors de l'envoie de l'avatar, veuillez réessayer!"
        return errorMsg
    }
}