package com.projet.clientleger.data.repository

import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.http.ApiConnectionInterface
import com.projet.clientleger.data.api.model.ConnectionModel
import com.projet.clientleger.data.api.model.RegisterResponse
import io.reactivex.rxjava3.core.Observable
import javax.inject.Inject
import javax.net.ssl.HttpsURLConnection

open class ConnectionRepository @Inject constructor(private val sessionManager: SessionManager, private val apiConnectionInterface: ApiConnectionInterface) {
    open suspend fun connectAccount(connectionModel: ConnectionModel): RegisterResponse {
        val res = apiConnectionInterface.login(connectionModel)
        return when (res.code()) {
            HttpsURLConnection.HTTP_INTERNAL_ERROR -> RegisterResponse(
                    false,
                    "Erreur du serveur",
                    "",
                    ""
            )
            HttpsURLConnection.HTTP_OK -> {
                sessionManager.saveCreds(res.body()!!.accessToken, res.body()!!.refreshToken)
                RegisterResponse(
                        true,
                        "",
                        res.body()!!.accessToken,
                        res.body()!!.refreshToken
                )
            }
            HttpsURLConnection.HTTP_NOT_FOUND ->
                RegisterResponse(
                        false,
                        "Nom d'utilisateur ou mot de passe invalide",
                        "",
                        ""
                )
            else -> RegisterResponse(false, "Erreur inconnue", "", "")
        }
    }
}