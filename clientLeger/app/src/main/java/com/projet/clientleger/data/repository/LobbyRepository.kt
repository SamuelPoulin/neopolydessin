package com.projet.clientleger.data.repository

import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.service.LobbySocketService
import com.projet.clientleger.data.api.service.SocketService
import javax.inject.Inject

class LobbyRepository @Inject constructor(private val sessionManager:SessionManager,private val lobbySocketService: LobbySocketService,private val socketService: SocketService) {
    fun connectSocket(accessToken: String){
        socketService.connect(accessToken)
    }
    fun getPlayerInfos(){
    }
}