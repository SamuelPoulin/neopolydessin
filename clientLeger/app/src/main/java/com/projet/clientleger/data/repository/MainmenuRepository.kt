package com.projet.clientleger.data.repository

import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.socket.LobbySocketService
import com.projet.clientleger.data.api.socket.SocketService
import com.projet.clientleger.data.enumData.Difficulty
import com.projet.clientleger.data.enumData.GameType
import javax.inject.Inject

class MainmenuRepository @Inject constructor(private val socketService: SocketService, private val lobbySocketService: LobbySocketService, private val sessionManager: SessionManager) {
    fun connectSocket(accessToken: String){
        socketService.connect(accessToken)
    }
    fun createGame(lobbyName: String, gameMode: GameType, difficulty: Difficulty, isPrivate:Boolean){
        lobbySocketService.createGame(lobbyName, gameMode,difficulty,isPrivate)
    }
    fun getUsername():String{
        return sessionManager.getUsername()
    }
    fun disconnect(){
        sessionManager.logout()
    }
}