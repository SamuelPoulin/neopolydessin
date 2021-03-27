package com.projet.clientleger.connexion

import com.projet.clientleger.data.api.ApiConnectionInterface
import com.projet.clientleger.data.api.model.ConnectionModel
import com.projet.clientleger.data.api.model.RegisterDataResponse
import okhttp3.ResponseBody
import retrofit2.Response
import javax.inject.Inject
import javax.net.ssl.HttpsURLConnection

class FakeApiConnectionInterface @Inject constructor(): ApiConnectionInterface {
    override suspend fun login(connectionModel: ConnectionModel): Response<RegisterDataResponse> {
        return when(connectionModel.username){
            "internal_error" -> Response.error(HttpsURLConnection.HTTP_INTERNAL_ERROR, ResponseBody.create(null, ""))
            "http_not_found" -> Response.error(HttpsURLConnection.HTTP_NOT_FOUND, ResponseBody.create(null, ""))
            "http_ok" -> Response.success(HttpsURLConnection.HTTP_OK, RegisterDataResponse("aToken", "rToken"))
            else -> Response.error(HttpsURLConnection.HTTP_CLIENT_TIMEOUT, ResponseBody.create(null, ""))
        }
    }
}