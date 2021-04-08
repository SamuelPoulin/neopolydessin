package com.projet.clientleger.data.api.http

import com.projet.clientleger.data.api.model.ConnectionModel
import com.projet.clientleger.data.api.model.RegisterDataResponse
import com.projet.clientleger.data.api.model.account.Account
import com.projet.clientleger.data.api.model.account.AccountDashboard
import com.projet.clientleger.data.model.account.UpdateAccountModel
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

const val databasePath: String = "api/database/"
interface ApiDashboardInterface {
    @GET(databasePath +"account")
    suspend fun getAccount(): Response<AccountDashboard>
    @POST(databasePath + "account")
    suspend fun updateAccount(@Body updateAccountModel: UpdateAccountModel):Response<Account>
}