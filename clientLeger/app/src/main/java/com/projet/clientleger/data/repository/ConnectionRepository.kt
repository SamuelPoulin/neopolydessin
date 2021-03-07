package com.projet.clientleger.data.repository

import com.projet.clientleger.data.api.ApiConnectionInterface
import com.projet.clientleger.data.api.model.ConnectionModel
import com.projet.clientleger.data.api.model.RegisterDataResponse
import com.projet.clientleger.data.api.model.RegisterResponse
import com.projet.clientleger.data.api.service.SocketService
import retrofit2.Response
import java.lang.Exception
import javax.inject.Inject
import javax.net.ssl.HttpsURLConnection

open class ConnectionRepository @Inject constructor(private val socketService: SocketService,private val apiConnectionInterface: ApiConnectionInterface){

    fun connectSocket(accessToken: String){
        socketService.connect(accessToken)
    }

    open suspend fun connectAccount(connectionModel: ConnectionModel): RegisterResponse{
        val res = apiConnectionInterface.login(connectionModel)
        return when (res.code()){
            HttpsURLConnection.HTTP_INTERNAL_ERROR -> RegisterResponse(
                    false,
                    "Erreur du serveur",
                    "",
                    ""
            )
            HttpsURLConnection.HTTP_OK -> RegisterResponse(
                    true,
                    "",
                    res.body()!!.accessToken,
                    res.body()!!.accessToken
            )
            HttpsURLConnection.HTTP_NOT_FOUND -> RegisterResponse(
                    false,
                    "Nom d'utilisateur ou mot de passe invalide",
                    "",
                    ""
            )
            else -> RegisterResponse(false, "Erreur inconnue", "", "")
        }
    }
}