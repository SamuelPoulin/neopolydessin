package com.projet.clientleger.data.repository

import com.projet.clientleger.data.api.ApiMainmenuInterface
import com.projet.clientleger.data.api.model.ConnectionModel
import com.projet.clientleger.data.api.model.Difficulty
import com.projet.clientleger.data.api.model.GameType
import com.projet.clientleger.data.api.model.RegisterDataResponse
import com.projet.clientleger.data.api.service.LobbySocketService
import com.projet.clientleger.data.api.service.SocketService
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

class MainmenuRepository @Inject constructor(private val socketService: SocketService, private val apiMainmenuInterface: ApiMainmenuInterface, private val lobbySocketService: LobbySocketService) {
    fun connectSocket(accessToken: String){
        socketService.connect(accessToken)
    }
    fun createGame(gameMode:GameType,difficulty:Difficulty, isPrivate:Boolean){
        lobbySocketService.createGame(gameMode,difficulty,isPrivate)
    }
}