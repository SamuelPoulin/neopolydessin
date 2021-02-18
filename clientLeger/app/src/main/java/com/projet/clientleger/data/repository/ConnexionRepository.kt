package com.projet.clientleger.data.repository
import io.reactivex.rxjava3.core.Single

interface ConnexionRepository {
    fun verifyConnexion(username: String): Single<Boolean>
}