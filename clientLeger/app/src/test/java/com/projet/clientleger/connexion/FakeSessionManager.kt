package com.projet.clientleger.connexion

import android.content.Context
import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.ApiConnectionInterface
import com.projet.clientleger.data.api.ApiSessionManagerInterface
import com.projet.clientleger.data.api.TokenInterceptor
import com.projet.clientleger.data.api.model.*
import okhttp3.ResponseBody
import retrofit2.Response
import javax.inject.Inject
import javax.net.ssl.HttpsURLConnection
import kotlin.reflect.KSuspendFunction0
import kotlin.reflect.KSuspendFunction1

class FakeSessionManager @Inject constructor(
        tokenInterceptor:TokenInterceptor,
        apiSessionManagerInterface: ApiSessionManagerInterface):SessionManager(null, tokenInterceptor, apiSessionManagerInterface){

    override fun saveCreds(accessToken: String, refreshToken: String){}
    override fun updateAccessToken(accessToken: String){}
    override fun getAccessToken(): String {
        return ""
    }
    override fun getRefreshToken(): String {
        return ""
    }

    override suspend fun refreshAccessToken(): AccessTokenResponse {
        return AccessTokenResponse(true,"","")
    }
    override suspend fun <S,T> request(toSend: S, callback: KSuspendFunction1<S, Response<T>>): Response<T>{
        var res = callback.invoke(toSend)
        if(res.code() == HttpsURLConnection.HTTP_UNAUTHORIZED || res.code() == HttpsURLConnection.HTTP_FORBIDDEN){
            refreshAccessToken()
            res = callback.invoke(toSend)
        }
        return res
    }
    override suspend fun <T> request(callback: KSuspendFunction0<Response<T>>): Response<T>{
        var res = callback.invoke()
        if(res.code() == HttpsURLConnection.HTTP_UNAUTHORIZED || res.code() == HttpsURLConnection.HTTP_FORBIDDEN){
            refreshAccessToken()
            res = callback.invoke()
        }
        return res
    }
}

