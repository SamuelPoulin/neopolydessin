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

open class AccountManagementRepository @Inject constructor(private val apiDashboardInterface: ApiDashboardInterface, private val sessionManager: SessionManager){
    open suspend fun getAccountInfos():AccountDashboard? {
        val res = apiDashboardInterface.getAccount()
        return res.body()
    }
    open suspend fun updateAccountInfos(account:UpdateAccountModel){
        apiDashboardInterface.updateAccount(account)
    }
    open suspend fun updateAvatar(image: MultipartBody.Part): Observable<Boolean> {
        return Observable.create { emitter ->
            apiDashboardInterface.uploadAvatar(image).enqueue(object : Callback<ResponseBody> {
                override fun onResponse(call: Call<ResponseBody>, response: Response<ResponseBody>) {
                    if(response.code() == HttpsURLConnection.HTTP_OK){
                        sessionManager.refreshAccountInfo().subscribe{
                            emitter.onNext(it)
                        }
                    } else
                        emitter.onNext(false)
                }

                override fun onFailure(call: Call<ResponseBody>, t: Throwable) {
                    emitter.onNext(false)
                }
            })
        }
    }
}