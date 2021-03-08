package com.projet.clientleger.data

import android.content.Context
import android.content.SharedPreferences
import androidx.core.content.edit
import com.projet.clientleger.R
import com.projet.clientleger.data.api.TokenInterceptor
import com.projet.clientleger.data.api.model.AccessTokenResponse
import com.projet.clientleger.data.api.model.RefreshTokenModel
import com.projet.clientleger.data.api.ApiSessionManagerInterface
import kotlinx.coroutines.*
import retrofit2.Response
import javax.inject.Inject
import javax.inject.Singleton
import javax.net.ssl.HttpsURLConnection
import kotlin.reflect.KSuspendFunction0
import kotlin.reflect.KSuspendFunction1

private const val ACCESS_TOKEN = "accessToken"
private const val REFRESH_TOKEN = "refreshToken"
@Singleton
class SessionManager @Inject constructor(
    context: Context,
    private val tokenInterceptor: TokenInterceptor,
    private val apiSessionManagerInterface: ApiSessionManagerInterface
) {


    private var userPrefs: SharedPreferences =
        context.getSharedPreferences(context.getString(R.string.user_creds), Context.MODE_PRIVATE)

    val scope = CoroutineScope(Job() + Dispatchers.Main)

    fun saveCreds(accessToken: String, refreshToken: String) {
        userPrefs.edit {
            putString(ACCESS_TOKEN, accessToken)
            putString(REFRESH_TOKEN, refreshToken)
            apply()
        }
        tokenInterceptor.setAccessToken(accessToken)
    }

    fun updateAccessToken(accessToken: String){
        userPrefs.edit {
            putString(ACCESS_TOKEN, accessToken)
            apply()
        }
        tokenInterceptor.setAccessToken(accessToken)
    }

    fun getAccessToken(): String {
        return userPrefs.getString(ACCESS_TOKEN, "")!!
    }

    fun getRefreshToken(): String {
        return userPrefs.getString(REFRESH_TOKEN, "")!!
    }

    suspend fun refreshAccessToken(): AccessTokenResponse {
        val res = apiSessionManagerInterface.refreshToken( RefreshTokenModel(getRefreshToken()) )
        return when(res.code()){
            HttpsURLConnection.HTTP_OK -> {
                updateAccessToken(res.body()!!.accessToken)
                AccessTokenResponse(true,"",res.body()!!.accessToken)
            }
            HttpsURLConnection.HTTP_BAD_REQUEST -> AccessTokenResponse(false, "Erreur dans la requete", "")
            HttpsURLConnection.HTTP_UNAUTHORIZED -> AccessTokenResponse(false, "Session expirer", "")
            HttpsURLConnection.HTTP_INTERNAL_ERROR -> AccessTokenResponse(false, "Erreur du serveur", "")
            else -> AccessTokenResponse(false, "Erreur inconnue", "")
        }
    }

    suspend fun <S,T> request(toSend: S, callback: KSuspendFunction1<S,Response<T>>): Response<T>{
        var res = callback.invoke(toSend)
        if(res.code() == HttpsURLConnection.HTTP_UNAUTHORIZED || res.code() == HttpsURLConnection.HTTP_FORBIDDEN){
            refreshAccessToken()
            res = callback.invoke(toSend)
        }
        return res
    }

    suspend fun <T> request(callback: KSuspendFunction0<Response<T>>): Response<T>{
        var res = callback.invoke()
        if(res.code() == HttpsURLConnection.HTTP_UNAUTHORIZED || res.code() == HttpsURLConnection.HTTP_FORBIDDEN){
            refreshAccessToken()
            res = callback.invoke()
        }
        return res
    }

}