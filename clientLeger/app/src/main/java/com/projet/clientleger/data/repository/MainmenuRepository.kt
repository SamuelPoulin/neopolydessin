package com.projet.clientleger.data.repository

import com.projet.clientleger.data.api.ApiMainmenuInterface
import com.projet.clientleger.data.api.model.ConnectionModel
import com.projet.clientleger.data.api.model.RegisterDataResponse
import com.projet.clientleger.data.api.service.SocketService
import javax.inject.Inject

class MainmenuRepository @Inject constructor(private val apiMainmenuInterface: ApiMainmenuInterface) {
    lateinit var socketService: SocketService

    suspend fun login(): RegisterDataResponse{
        return apiMainmenuInterface.login(ConnectionModel("s", "ssssss")).body()!!
    }

    fun connectSocket(accessToken: String){
        socketService.connect(accessToken)
    }
}