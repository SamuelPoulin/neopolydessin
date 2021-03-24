package com.projet.clientleger.connexion

import com.projet.clientleger.data.api.ApiConnectionInterface
import com.projet.clientleger.data.api.model.ConnectionModel
import com.projet.clientleger.data.api.model.RegisterDataResponse
import retrofit2.Response
import javax.inject.Inject

class FakeApiConnectionInterface @Inject constructor(): ApiConnectionInterface {
    override suspend fun login(connectionModel: ConnectionModel): Response<RegisterDataResponse> {
        return Response.success(RegisterDataResponse("", ""))
    }
}