package com.projet.clientleger.data.api.http

import com.projet.clientleger.data.api.model.ConnectionModel
import com.projet.clientleger.data.api.model.RegisterDataResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

const val databasePath: String = "api/database/"
interface ApiDashboardInterface {
    @POST(databasePath +"account")
    suspend fun getAccount(): Response<RegisterDataResponse>
}