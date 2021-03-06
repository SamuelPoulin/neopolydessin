package com.projet.clientleger.data.repository

import com.projet.clientleger.data.api.ApiMainmenuInterface
import com.projet.clientleger.data.api.model.ConnectionModel
import com.projet.clientleger.data.api.model.RegisterDataResponse
import com.projet.clientleger.data.api.service.SocketService
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

class MainmenuRepository @Inject constructor(private val socketService: SocketService, private val apiMainmenuInterface: ApiMainmenuInterface) {

    suspend fun login(): RegisterDataResponse{
        return apiMainmenuInterface.login(ConnectionModel("guiboy", "testtest1")).body()!!
    }

    fun connectSocket(accessToken: String){
        socketService.connect(accessToken)
    }
}