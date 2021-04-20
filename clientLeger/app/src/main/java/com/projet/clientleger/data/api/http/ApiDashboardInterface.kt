package com.projet.clientleger.data.api.http

import android.graphics.Bitmap
import com.projet.clientleger.data.api.model.ConnectionModel
import com.projet.clientleger.data.api.model.RegisterDataResponse
import com.projet.clientleger.data.api.model.account.Account
import com.projet.clientleger.data.api.model.account.AccountDashboard
import com.projet.clientleger.data.model.account.UpdateAccountModel
import okhttp3.MultipartBody
import okhttp3.RequestBody
import okhttp3.ResponseBody
import retrofit2.Call
import retrofit2.Response
import retrofit2.http.*

const val databasePath: String = "api/database/"
const val avatarPath:String = "api/avatar/"
interface ApiDashboardInterface {
    @GET(databasePath +"dashboard")
    suspend fun getAccount(): Response<AccountDashboard>
    @POST(databasePath + "account")
    suspend fun updateAccount(@Body updateAccountModel: UpdateAccountModel):Response<Account>
    @Multipart
    @POST(avatarPath + "upload")
    suspend fun uploadAvatar(
        @Part file:MultipartBody.Part
    ):Response<Any>
}