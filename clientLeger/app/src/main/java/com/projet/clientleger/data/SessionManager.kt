package com.projet.clientleger.data

import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.graphics.*
import android.os.Bundle
import androidx.core.content.edit
import com.projet.clientleger.R
import com.projet.clientleger.data.api.TokenInterceptor
import com.projet.clientleger.data.api.http.ApiAvatarInterface
import com.projet.clientleger.data.api.http.ApiErrorMessages
import com.projet.clientleger.data.api.http.ApiSessionManagerInterface
import com.projet.clientleger.data.api.model.RefreshTokenModel
import com.projet.clientleger.data.api.model.account.Account
import com.projet.clientleger.data.api.socket.SocketService
import com.projet.clientleger.data.model.account.AccountInfo
import com.projet.clientleger.data.service.ChatStorageService
import com.projet.clientleger.ui.connexion.view.ConnexionActivity
import com.projet.clientleger.utils.BitmapConversion
import io.reactivex.rxjava3.annotations.NonNull
import io.reactivex.rxjava3.core.Observable
import kotlinx.coroutines.*
import okhttp3.ResponseBody
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import javax.inject.Inject
import javax.inject.Singleton
import javax.net.ssl.HttpsURLConnection
import kotlin.reflect.KFunction
import kotlin.reflect.KSuspendFunction0
import kotlin.reflect.KSuspendFunction1
import kotlin.reflect.KSuspendFunction3


private const val ACCESS_TOKEN = "accessToken"
private const val REFRESH_TOKEN = "refreshToken"

@Singleton

open class SessionManager @Inject constructor(
        private val context: Context?,
        private val tokenInterceptor: TokenInterceptor,
        private val apiSessionManagerInterface: ApiSessionManagerInterface,
        private val apiAvatarInterface: ApiAvatarInterface,
        private val socketService: SocketService
) {
    companion object {
        const val ERROR_MESSAGE = "errorMessage"
        const val SESSION_EXPIRED = "Session expirée"
    }

    private var accountInfo: AccountInfo? = null
    private var userPrefs: SharedPreferences? =
            context?.getSharedPreferences(context.getString(R.string.user_creds), Context.MODE_PRIVATE)


    private val scope = CoroutineScope(Job() + Dispatchers.Main)

    init {
        if (context != null) {
            userPrefs = context.getSharedPreferences(context.getString(R.string.user_creds), Context.MODE_PRIVATE)
        }
    }

    suspend fun saveCreds(accessToken: String, refreshToken: String) {
        userPrefs?.edit {
            putString(ACCESS_TOKEN, accessToken)
            putString(REFRESH_TOKEN, refreshToken)
            apply()
        }
        tokenInterceptor.setAccessToken(accessToken)
        socketService.connect(accessToken)
        refreshAccountInfo()
    }

    suspend fun refreshAccountInfo() {
        val res = apiSessionManagerInterface.getAccountInfo()
        when (res.code()) {
            HttpsURLConnection.HTTP_OK -> saveAccountInfo(res.body())
            HttpsURLConnection.HTTP_UNAUTHORIZED -> {
                logoutAndRestart(SESSION_EXPIRED)
            }
            else -> {
                logoutAndRestart(ApiErrorMessages.UNKNOWN_ERROR)
            }
        }
    }

    private suspend fun saveAccountInfo(info: Account?) {
        if (info != null) {
            val res = request(info.avatar, apiAvatarInterface::getAvatar)
            val avatar: Bitmap? = if (res.code() == HttpsURLConnection.HTTP_OK) {
                val bitmap = BitmapFactory.decodeStream(res.body()!!.byteStream())
                BitmapConversion.toRoundedBitmap(bitmap)
            } else {
                if (context != null) {
                    BitmapConversion.vectorDrawableToBitmap(context, R.drawable.ic_missing_player)
                } else {
                    null
                }
            }
            accountInfo = info.toAccountInfo(avatar)
        }
    }

    fun getAccountInfo(): AccountInfo {
        return accountInfo ?: AccountInfo()
    }

    fun getUsername(): String {
        return accountInfo?.username ?: "utilisateur"
    }

    fun clearCred() {
        userPrefs?.edit {
            clear()
            apply()
        }
    }

    open fun updateAccessToken(accessToken: String) {
        userPrefs?.edit {
            putString(ACCESS_TOKEN, accessToken)
            apply()
        }
        tokenInterceptor.setAccessToken(accessToken)
    }

    open fun getAccessToken(): String {
        return userPrefs?.getString(ACCESS_TOKEN, "")!!
    }

    open fun getRefreshToken(): String {
        return userPrefs?.getString(REFRESH_TOKEN, "")!!
    }


    open suspend fun refreshAccessToken() {
        val res = apiSessionManagerInterface.refreshToken(RefreshTokenModel(getRefreshToken()))
        return when (res.code()) {
            HttpsURLConnection.HTTP_OK -> {
                updateAccessToken(res.body()!!.accessToken)
            }
            HttpsURLConnection.HTTP_BAD_REQUEST -> logoutAndRestart(ApiErrorMessages.BAD_REQUEST)
            HttpsURLConnection.HTTP_UNAUTHORIZED -> logoutAndRestart(SESSION_EXPIRED)
            HttpsURLConnection.HTTP_INTERNAL_ERROR -> logoutAndRestart(ApiErrorMessages.SERVER_ERROR)
            else -> logoutAndRestart(ApiErrorMessages.UNKNOWN_ERROR)
        }
    }

    open suspend fun <S, T> request(toSend: S, callback: KSuspendFunction1<S, Response<T>>): Response<T> {
        var res = callback.invoke(toSend)
        if (res.code() == HttpsURLConnection.HTTP_UNAUTHORIZED || res.code() == HttpsURLConnection.HTTP_FORBIDDEN) {
            refreshAccessToken()
            res = callback.invoke(toSend)
        }
        return res
    }


    open suspend fun <T> request(callback: KSuspendFunction0<Response<T>>): Response<T> {
        var res = callback.invoke()
        if (res.code() == HttpsURLConnection.HTTP_UNAUTHORIZED || res.code() == HttpsURLConnection.HTTP_FORBIDDEN) {
            refreshAccessToken()
            res = callback.invoke()
        }
        return res
    }

    open suspend fun <Q, R, S, T> request(qSend: Q, rSend: R, sSend: S, callback: KSuspendFunction3<Q, R, S, Response<T>>): Response<T> {
        var res = callback.invoke(qSend, rSend, sSend)
        if (res.code() == HttpsURLConnection.HTTP_UNAUTHORIZED || res.code() == HttpsURLConnection.HTTP_FORBIDDEN) {
            refreshAccessToken()
            res = callback.invoke(qSend, rSend, sSend)
        }
        return res
    }

    fun logoutAndRestart(errorMessage: String?) {
        logout()
        val intent = Intent(context, ConnexionActivity::class.java)
        val bundle = Bundle()
        errorMessage.let {
            bundle.putString(ERROR_MESSAGE, errorMessage)
        }
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context?.startActivity(intent, bundle)
    }

    fun logout() {
        tokenInterceptor.clearToken()
        clearCred()
        socketService.disconnect()
    }
}
