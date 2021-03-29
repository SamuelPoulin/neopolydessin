package com.projet.clientleger.data.repository

import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.model.Difficulty
import com.projet.clientleger.data.api.model.GameType
import com.projet.clientleger.data.api.model.PlayerRole
import com.projet.clientleger.data.api.socket.LobbySocketService
import com.projet.clientleger.data.model.LobbyList
import com.projet.clientleger.data.model.lobby.PlayerInfo
import io.reactivex.rxjava3.core.Observable
import javax.inject.Inject

class LobbyRepository @Inject constructor(private val lobbySocketService: LobbySocketService, private val sessionManager: SessionManager) {
    fun receivedPlayersInfo(): Observable<String> {
        return lobbySocketService.receivePlayersInfo()
    }
    fun receivedAllLobbies(gameMode: GameType, difficulty: Difficulty) : Observable<LobbyList>{
        return lobbySocketService.receiveAllLobbies(gameMode,difficulty)
    }

    fun receiveJoinedLobbyInfo() : Observable<ArrayList<PlayerInfo>>{
        return Observable.create {
            val players =  lobbySocketService.receiveJoinedLobbyInfo().subscribe{
                val list = ArrayList<PlayerInfo>()
                for(player in it){

                }
            }
        }
    }

    fun joinLobby(lobbyId: String){
        lobbySocketService.joinLobby(lobbyId)
    }

    fun startGame(){
        lobbySocketService.startGame()
    }
    fun getUsername(): String{
        return sessionManager.getUsername()
    }

    fun receiveStartGame() : Observable<ArrayList<PlayerRole>>{
        return lobbySocketService.receiveStartGame()
    }
}