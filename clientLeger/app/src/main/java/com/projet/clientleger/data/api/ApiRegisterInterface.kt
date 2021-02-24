package com.projet.clientleger.data.api

import com.projet.clientleger.data.api.model.RegisterModel
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.POST
const val authPath: String = "api/database/auth/"
interface ApiRegisterInterface {
    @POST(authPath+"register")
    fun registerAccount(@Body registerModel: RegisterModel): Call<String>
}