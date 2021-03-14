package com.projet.clientleger.data.api

import com.projet.clientleger.data.api.authPath
import com.projet.clientleger.data.api.model.AccessTokenModel
import com.projet.clientleger.data.api.model.RefreshTokenModel
import org.json.JSONObject
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface ApiSessionManagerInterface {
    @POST(authPath+"refresh")
    suspend fun refreshToken(@Body refreshToken: RefreshTokenModel): Response<AccessTokenModel>
}