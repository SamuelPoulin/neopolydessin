package com.projet.clientleger.data.repository

import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.http.ApiRegisterInterface
import com.projet.clientleger.data.api.model.RegisterModel
import com.projet.clientleger.data.api.model.RegisterResponse
import io.reactivex.rxjava3.core.Observable
import javax.inject.Inject
import javax.net.ssl.HttpsURLConnection

open class RegisterRepository @Inject constructor(private val sessionManager: SessionManager, private val apiRegisterInterface: ApiRegisterInterface) {

    open suspend fun registerAccount(registerModel: RegisterModel): Observable<RegisterResponse> {
        val res = apiRegisterInterface.registerAccount(registerModel)
        return Observable.create { emitter ->
            when (res.code()) {
                HttpsURLConnection.HTTP_INTERNAL_ERROR -> emitter.onNext(RegisterResponse(
                    false,
                    "Erreur du serveur",
                    "",
                    ""
                ))
                HttpsURLConnection.HTTP_BAD_REQUEST -> emitter.onNext(RegisterResponse(
                    false,
                    "Nom d'utilisateur ou adresse courielle déjà utilisé",
                    "",
                    ""
                ))
                HttpsURLConnection.HTTP_OK -> {
                    sessionManager.saveCreds(res.body()!!.accessToken, res.body()!!.refreshToken).subscribe {
                        emitter.onNext(
                            RegisterResponse(
                                true,
                                "",
                                res.body()!!.accessToken,
                                res.body()!!.accessToken
                            )
                        )
                    }
                }
                else -> emitter.onNext(RegisterResponse(false, "Erreur inconnue", "", ""))
            }
        }
    }
}