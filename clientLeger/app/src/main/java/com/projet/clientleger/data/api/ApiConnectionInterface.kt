package com.projet.clientleger.data.api

import com.projet.clientleger.data.api.model.ConnectionModel
import com.projet.clientleger.data.api.model.RegisterDataResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST
interface ApiConnectionInterface {
    @POST(authPath+"connection")
    suspend fun connectAccount(@Body connectionModel: ConnectionModel): Response<RegisterDataResponse>
}