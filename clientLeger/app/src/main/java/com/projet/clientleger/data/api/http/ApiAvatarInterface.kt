package com.projet.clientleger.data.api.http

import okhttp3.ResponseBody
import retrofit2.Call
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Path

interface ApiAvatarInterface {
    @GET("api/avatar/{id}")
    suspend fun getAvatar(@Path("id") id: String): Response<ResponseBody>
}