package com.projet.clientleger.data.repository

import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.http.ApiMainmenuInterface
import com.projet.clientleger.data.api.model.Difficulty
import com.projet.clientleger.data.api.model.GameType
import com.projet.clientleger.data.api.socket.LobbySocketService
import com.projet.clientleger.data.api.socket.SocketService
import javax.inject.Inject

class MainmenuRepository @Inject constructor(private val socketService: SocketService, private val apiMainmenuInterface: ApiMainmenuInterface, private val lobbySocketService: LobbySocketService, private val sessionManager: SessionManager) {
    fun connectSocket(accessToken: String){
        socketService.connect(accessToken)
    }
    fun createGame(lobbyName: String, gameMode:GameType,difficulty:Difficulty, isPrivate:Boolean){
        lobbySocketService.createGame(lobbyName, gameMode,difficulty,isPrivate)
    }
    fun getUsername():String{
        return sessionManager.getUsername()
    }
}