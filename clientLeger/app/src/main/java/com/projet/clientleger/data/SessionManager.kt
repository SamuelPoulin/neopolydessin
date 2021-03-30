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
import com.projet.clientleger.data.model.account.AccountInfo
import com.projet.clientleger.ui.connexion.view.ConnexionActivity
import com.projet.clientleger.utils.BitmapConversion
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


private const val ACCESS_TOKEN = "accessToken"
private const val REFRESH_TOKEN = "refreshToken"

@Singleton

open class SessionManager @Inject constructor(
        private val context: Context?,
        private val tokenInterceptor: TokenInterceptor,
        private val apiSessionManagerInterface: ApiSessionManagerInterface,
        private val apiAvatarInterface: ApiAvatarInterface
) {
    companion object{
        const val ERROR_MESSAGE = "errorMessage"
        const val SESSION_EXPIRED = "Session expirée"
    }

    private var accountInfo: AccountInfo? = null
    private var userPrefs: SharedPreferences? =
            context?.getSharedPreferences(context.getString(R.string.user_creds), Context.MODE_PRIVATE)


    val scope = CoroutineScope(Job() + Dispatchers.Main)
    init {
        if(context != null){
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
        val res = apiSessionManagerInterface.getAccountInfo()
        when(res.code()){
            HttpsURLConnection.HTTP_OK -> saveAccountInfo(res.body())
            HttpsURLConnection.HTTP_UNAUTHORIZED -> logout(SESSION_EXPIRED)
            else -> logout(ApiErrorMessages.UNKNOWN_ERROR)
        }
    }

    private fun saveAccountInfo(info: Account?){
        if (info != null) {
            apiAvatarInterface.getAvatar(info.avatar._id).enqueue(object : Callback<ResponseBody> {
                override fun onResponse(call: Call<ResponseBody>, response: Response<ResponseBody>) {
                    val bitmap = BitmapFactory.decodeStream(response.body()!!.byteStream())
                    val roundedBitmap = BitmapConversion.toRoundedBitmap(bitmap)
                    accountInfo = info.toAccountInfo(roundedBitmap)
                }

                override fun onFailure(call: Call<ResponseBody>, t: Throwable) {
                    TODO("Not yet implemented")
                }
            })
        }
    }

    fun getAccountInfo(): AccountInfo{
        return accountInfo ?: AccountInfo()
    }

    fun getUsername(): String{
        return accountInfo?.username ?: "utilisateur"
    }

    fun clearCred(){
        userPrefs?.edit{
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
        return when(res.code()){
            HttpsURLConnection.HTTP_OK -> {
                updateAccessToken(res.body()!!.accessToken)
            }
            HttpsURLConnection.HTTP_BAD_REQUEST -> logout(ApiErrorMessages.BAD_REQUEST)
            HttpsURLConnection.HTTP_UNAUTHORIZED -> logout(SESSION_EXPIRED)
            HttpsURLConnection.HTTP_INTERNAL_ERROR -> logout(ApiErrorMessages.SERVER_ERROR)
            else -> logout(ApiErrorMessages.UNKNOWN_ERROR)
        }
    }

    open suspend fun <S, T> request(toSend: S, callback: KSuspendFunction1<S, Response<T>>): Response<T>{
        var res = callback.invoke(toSend)
        if (res.code() == HttpsURLConnection.HTTP_UNAUTHORIZED || res.code() == HttpsURLConnection.HTTP_FORBIDDEN) {
            refreshAccessToken()
            res = callback.invoke(toSend)
        }
        return res
    }


    open suspend fun <T> request(callback: KSuspendFunction0<Response<T>>): Response<T>{
        var res = callback.invoke()
        if (res.code() == HttpsURLConnection.HTTP_UNAUTHORIZED || res.code() == HttpsURLConnection.HTTP_FORBIDDEN) {
            refreshAccessToken()
            res = callback.invoke()
        }
        return res
    }

    open fun <S, T> request(toSend: S, callBack: KFunction<Call<T>>): Response<T>{
        var res = callBack.call(toSend).execute()
        if(res.code() == HttpsURLConnection.HTTP_UNAUTHORIZED || res.code() == HttpsURLConnection.HTTP_FORBIDDEN){
            scope.launch {
                refreshAccessToken()
            }
            res = callBack.call(toSend).execute()
        }
        return res
    }


    fun logout(errorMessage: String?){
        tokenInterceptor.clearToken()
        clearCred()
        val intent = Intent(context, ConnexionActivity::class.java)
        val bundle = Bundle()
        errorMessage.let {
            bundle.putString(ERROR_MESSAGE, errorMessage)
        }
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context?.startActivity(intent, bundle)
    }
}
