package com.projet.clientleger.register

import com.projet.clientleger.data.api.http.ApiRegisterInterface
import com.projet.clientleger.data.api.model.RegisterModel
import com.projet.clientleger.data.api.model.RegisterResponse
import com.projet.clientleger.data.repository.RegisterRepository
import javax.inject.Inject

class FakeRegisterRepository @Inject constructor(apiRegisterInterface: ApiRegisterInterface) : RegisterRepository(
        apiRegisterInterface
) {

    override suspend fun registerAccount(registerModel: RegisterModel): RegisterResponse {
        return if (registerModel.username == "invalid") {
            RegisterResponse(false, "", "", "")
        } else
            RegisterResponse(true, "", "access", "refresh")
    }
}