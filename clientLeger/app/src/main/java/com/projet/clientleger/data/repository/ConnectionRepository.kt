package com.projet.clientleger.data.repository

import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.http.ApiConnectionInterface
import com.projet.clientleger.data.api.model.ConnectionModel
import com.projet.clientleger.data.api.model.RegisterResponse
import io.reactivex.rxjava3.core.Observable
import javax.inject.Inject
import javax.net.ssl.HttpsURLConnection

open class ConnectionRepository @Inject constructor(private val sessionManager: SessionManager, private val apiConnectionInterface: ApiConnectionInterface) {
    open suspend fun connectAccount(connectionModel: ConnectionModel): Observable<RegisterResponse> {
        val res = apiConnectionInterface.login(connectionModel)
        return Observable.create { emitter ->
            when (res.code()) {
                HttpsURLConnection.HTTP_INTERNAL_ERROR ->
                    emitter.onNext(RegisterResponse(
                            false,
                            "Erreur du serveur",
                            "",
                            ""
                    ))
                HttpsURLConnection.HTTP_OK -> {
                    sessionManager.saveCreds(res.body()!!.accessToken, res.body()!!.refreshToken).subscribe {
                        emitter.onNext(RegisterResponse(
                                true,
                                "",
                                res.body()!!.accessToken,
                                res.body()!!.refreshToken
                        ))
                    }
                }
                HttpsURLConnection.HTTP_NOT_FOUND ->
                    emitter.onNext(RegisterResponse(
                            false,
                            "Nom d'utilisateur ou mot de passe invalide",
                            "",
                            ""
                    ))
                else -> emitter.onNext(RegisterResponse(false, "Erreur inconnue", "", ""))
            }
        }
    }
}