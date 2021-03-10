package com.projet.clientleger.data.repository

import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.ApiRegisterInterface
import com.projet.clientleger.data.api.model.RegisterModel
import com.projet.clientleger.data.api.model.RegisterResponse
import javax.inject.Inject
import javax.net.ssl.HttpsURLConnection

open class RegisterRepository @Inject constructor(private val sessionManager: SessionManager, private val apiRegisterInterface: ApiRegisterInterface) {

    open suspend fun registerAccount(registerModel: RegisterModel): RegisterResponse {
        val res = apiRegisterInterface.registerAccount(registerModel)
        sessionManager.request(registerModel, apiRegisterInterface::registerAccount)
        return when (res.code()) {

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
            HttpsURLConnection.HTTP_OK -> {
                sessionManager.saveCreds(res.body()!!.accessToken, res.body()!!.refreshToken)
                RegisterResponse(
                    true,
                    "",
                    res.body()!!.accessToken,
                    res.body()!!.accessToken
                )
            }
            else -> RegisterResponse(false, "Erreur inconnue", "", "")

        }
    }
}