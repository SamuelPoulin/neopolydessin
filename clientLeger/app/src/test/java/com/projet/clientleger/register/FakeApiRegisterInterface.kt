package com.projet.clientleger.register

import com.projet.clientleger.data.api.ApiRegisterInterface
import com.projet.clientleger.data.api.model.RegisterDataResponse
import com.projet.clientleger.data.api.model.RegisterModel
import okhttp3.ResponseBody
import retrofit2.Response
import javax.inject.Inject
import javax.net.ssl.HttpsURLConnection

class FakeApiRegisterInterface @Inject constructor(): ApiRegisterInterface {

    override suspend fun registerAccount(registerModel: RegisterModel): Response<RegisterDataResponse> {
        return when (registerModel.username) {
            "unknown" -> Response.error(HttpsURLConnection.HTTP_BAD_GATEWAY, ResponseBody.create(null, ""))
            "invalid" -> Response.error(HttpsURLConnection.HTTP_BAD_REQUEST, ResponseBody.create(null, ""))
            "error_server" -> Response.error(HttpsURLConnection.HTTP_INTERNAL_ERROR, ResponseBody.create(null, ""))
            else -> Response.success(RegisterDataResponse("access", "refresh"))
        }
    }
}