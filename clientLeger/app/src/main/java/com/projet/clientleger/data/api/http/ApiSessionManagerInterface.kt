package com.projet.clientleger.data.api.http

import com.projet.clientleger.data.api.model.AccessTokenModel
import com.projet.clientleger.data.api.model.RefreshTokenModel
import com.projet.clientleger.data.api.model.account.Account
import okhttp3.ResponseBody
import retrofit2.Call
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

interface ApiSessionManagerInterface {
    @POST(authPath +"refresh")
    suspend fun refreshToken(@Body refreshToken: RefreshTokenModel): Response<AccessTokenModel>

    @GET("api/database/account")
    suspend fun getAccountInfo(): Response<Account>

}