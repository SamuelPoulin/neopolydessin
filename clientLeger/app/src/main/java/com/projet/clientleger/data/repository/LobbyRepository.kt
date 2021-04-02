package com.projet.clientleger.data.repository

import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.http.ApiAvatarInterface
import com.projet.clientleger.data.api.socket.LobbySocketService
import com.projet.clientleger.data.enumData.Difficulty
import com.projet.clientleger.data.enumData.GameType
import com.projet.clientleger.data.model.LobbyList
import com.projet.clientleger.data.model.account.AccountInfo
import com.projet.clientleger.data.model.lobby.PlayerInfo
import com.projet.clientleger.data.service.AvatarStorageService
import io.reactivex.rxjava3.core.Observable
import javax.inject.Inject

class LobbyRepository @Inject constructor(private val lobbySocketService: LobbySocketService,
                                          private val sessionManager: SessionManager,
                                          private val apiAvatarInterface: ApiAvatarInterface,
                                          private val avatarStorageService: AvatarStorageService) {
    fun receivePlayerJoin(): Observable<PlayerInfo> {
        return Observable.create { emitter ->
            lobbySocketService.receivePlayerJoin().subscribe{
                avatarStorageService.addPlayer(it)
                emitter.onNext(it.toPlayerInfo(avatarStorageService.getAvatar(it.accountId)))
            }
        }
    }

    fun receivePlayerLeave(): Observable<String>{
        return lobbySocketService.receivePlayerLeave()
    }

    fun receivedAllLobbies(gameType: GameType, difficulty: Difficulty) : Observable<LobbyList>{
        return lobbySocketService.receiveAllLobbies(gameType,difficulty)
    }

    fun leaveLobby(){
        lobbySocketService.leaveLobby()
    }

    fun receiveJoinedLobbyInfo() : Observable<ArrayList<PlayerInfo>>{
        return Observable.create { emitter ->
            lobbySocketService.receiveJoinedLobbyInfo().subscribe{
                val list = ArrayList<PlayerInfo>()
                for(player in it){
                    avatarStorageService.addPlayer(player)
                    list.add(player.toPlayerInfo(avatarStorageService.getAvatar(player.accountId)))
                }
                emitter.onNext(list)
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

    fun receiveStartGame():Observable<String>{
        return lobbySocketService.receiveStartGame()
    }

    fun getUserInfo(): AccountInfo{
        return sessionManager.getAccountInfo()
    }

    fun clearAvatarStorage(){
        avatarStorageService.clear()
    }

    fun kickPlayer(){

    }
}