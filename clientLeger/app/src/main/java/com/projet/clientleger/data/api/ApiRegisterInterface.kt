package com.projet.clientleger.data.api

import com.projet.clientleger.data.api.model.RegisterDataResponse
import com.projet.clientleger.data.api.model.RegisterModel
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST
const val authPath: String = "api/database/auth/"
interface ApiRegisterInterface {
    @POST(authPath+"register")
    suspend fun registerAccount(@Body registerModel: RegisterModel): Response<RegisterDataResponse>
}