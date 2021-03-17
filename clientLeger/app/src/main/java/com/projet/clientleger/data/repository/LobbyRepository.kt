package com.projet.clientleger.data.repository

import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.model.Difficulty
import com.projet.clientleger.data.api.model.GameType
import com.projet.clientleger.data.api.model.LobbyInfo
import com.projet.clientleger.data.api.service.LobbySocketService
import com.projet.clientleger.data.api.service.SocketService
import com.projet.clientleger.data.model.LobbyList
import io.reactivex.rxjava3.core.Observable
import javax.inject.Inject

class LobbyRepository @Inject constructor(private val lobbySocketService: LobbySocketService) {
    fun receivedPlayersInfo(): Observable<String> {
        return lobbySocketService.receivePlayersInfo()
    }
    fun receivedAllLobbies(gameMode: GameType, difficulty: Difficulty) : Observable<LobbyList>{
        return lobbySocketService.receiveAllLobbies(gameMode,difficulty)
    }
}