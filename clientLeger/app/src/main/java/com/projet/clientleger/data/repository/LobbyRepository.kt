package com.projet.clientleger.data.repository

import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.http.ApiAvatarInterface
import com.projet.clientleger.data.api.socket.LobbySocketService
import com.projet.clientleger.data.enumData.Difficulty
import com.projet.clientleger.data.enumData.GameType
import com.projet.clientleger.data.model.account.AccountInfo
import com.projet.clientleger.data.model.chat.TabInfo
import com.projet.clientleger.data.model.lobby.LobbyInfo
import com.projet.clientleger.data.model.lobby.PlayerInfo
import com.projet.clientleger.data.service.AvatarStorageService
import com.projet.clientleger.data.service.ChatStorageService
import io.reactivex.rxjava3.core.Observable
import javax.inject.Inject

class LobbyRepository @Inject constructor(private val lobbySocketService: LobbySocketService,
                                          private val sessionManager: SessionManager,
                                          private val avatarStorageService: AvatarStorageService) {
    val accountInfo = sessionManager.getAccountInfo()
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

    fun unsubscribeLobby(){
        lobbySocketService.unsubscribeLobby()
    }
    fun unsubscribeLobbyList(){
        lobbySocketService.unsubscribeLobbyList()
    }

    fun receivedAllLobbies(gameType: GameType?, difficulty: Difficulty?) : Observable<ArrayList<LobbyInfo>>{
        return lobbySocketService.receiveAllLobbies(gameType,difficulty)
    }

    fun leaveLobby(){
        lobbySocketService.leaveLobby()
    }

    fun createGame(gameName: String, gameType: GameType, difficulty: Difficulty, isPrivate: Boolean): Observable<LobbyInfo> {
        return lobbySocketService.createGame(gameName, gameType, difficulty, isPrivate)
    }

    fun receiveJoinedLobbyInfo() : Observable<ArrayList<PlayerInfo>>{
        return Observable.create { emitter ->
            lobbySocketService.receiveJoinedLobbyInfo().subscribe{
                val list = ArrayList<PlayerInfo>()
                for(player in it){
                    if(accountInfo.accountId == player.accountId)
                        avatarStorageService.addPlayer(accountInfo)
                    else
                        avatarStorageService.addPlayer(player)
                    list.add(player.toPlayerInfo(avatarStorageService.getAvatar(player.accountId)))
                }
                emitter.onNext(list)
            }
        }
    }

    fun joinLobby(lobbyId: String): Observable<LobbyInfo> {
        return lobbySocketService.joinLobby(lobbyId)
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

    fun addBot(teamNumber: Int){
        lobbySocketService.addBot(teamNumber)
    }

    fun removeBot(username: String){
        lobbySocketService.removeBot(username)
    }

    fun kickPlayer(playerId: String){
        lobbySocketService.kickPlayer(playerId)
    }

    fun receiveKick(): Observable<Unit> {
        return lobbySocketService.receiveKick()
    }

    fun receiveUpdateLobbyList(): Observable<ArrayList<LobbyInfo>> {
        return lobbySocketService.receiveUpdateLobbyList()
    }

    fun sendPrivacySetting(isPrivate: Boolean){
        lobbySocketService.sendPrivacySetting(isPrivate)
    }

    fun receivePrivacySetting(): Observable<Boolean> {
        return lobbySocketService.receivePrivacySetting()
    }
}