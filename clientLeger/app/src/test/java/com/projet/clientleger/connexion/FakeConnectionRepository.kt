package com.projet.clientleger.connexion

import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.ApiConnectionInterface
import com.projet.clientleger.data.api.ApiRegisterInterface
import com.projet.clientleger.data.api.model.ConnectionModel
import com.projet.clientleger.data.api.model.RegisterModel
import com.projet.clientleger.data.api.model.RegisterResponse
import com.projet.clientleger.data.repository.ConnectionRepository
import com.projet.clientleger.data.repository.RegisterRepository
import javax.inject.Inject

class FakeConnectionRepository @Inject constructor(sessionManager: SessionManager, apiConnectionInterface: ApiConnectionInterface) : ConnectionRepository(
    sessionManager,apiConnectionInterface
)  {
    override suspend fun connectAccount(connectionModel: ConnectionModel): RegisterResponse {
        return if (connectionModel.username == "invalid") {
            RegisterResponse(false, "", "", "")
        } else
            RegisterResponse(true, "", "access", "refresh")
    }
}