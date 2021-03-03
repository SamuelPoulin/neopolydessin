package com.projet.clientleger.data.repository

import com.projet.clientleger.data.api.ApiConnectionInterface
import com.projet.clientleger.data.api.model.ConnectionModel
import com.projet.clientleger.data.api.model.RegisterResponse
import javax.inject.Inject
import javax.net.ssl.HttpsURLConnection

open class ConnectionRepository @Inject constructor(private val apiConnectionInterface: ApiConnectionInterface){

    open suspend fun connectAccount(connectionModel: ConnectionModel): RegisterResponse{
        val res = apiConnectionInterface.connectAccount(connectionModel)
        return when (res.code()){
            HttpsURLConnection.HTTP_INTERNAL_ERROR -> RegisterResponse(
                    false,
                    "Erreur du serveur",
                    "",
                    ""
            )

            HttpsURLConnection.HTTP_BAD_REQUEST -> RegisterResponse(
                    false,
                    "Nom d'utilisateur ou adresse courielle déjà utilisé",
                    "",
                    ""
            )
            HttpsURLConnection.HTTP_OK -> RegisterResponse(
                    true,
                    "",
                    res.body()!!.accessToken,
                    res.body()!!.accessToken
            )
            else -> RegisterResponse(false, "Erreur inconnue", "", "")
        }
    }
}