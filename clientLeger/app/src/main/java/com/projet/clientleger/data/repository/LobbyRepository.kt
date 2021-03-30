package com.projet.clientleger.data.repository

import android.accounts.Account
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.http.ApiAvatarInterface
import com.projet.clientleger.data.api.model.Difficulty
import com.projet.clientleger.data.api.model.GameType
import com.projet.clientleger.data.api.model.PlayerRole
import com.projet.clientleger.data.api.socket.LobbySocketService
import com.projet.clientleger.data.model.LobbyList
import com.projet.clientleger.data.model.account.AccountInfo
import com.projet.clientleger.data.model.lobby.PlayerInfo
import io.reactivex.rxjava3.core.Observable
import javax.inject.Inject
import javax.net.ssl.HttpsURLConnection

class LobbyRepository @Inject constructor(private val lobbySocketService: LobbySocketService,
                                          private val sessionManager: SessionManager,
                                          private val apiAvatarInterface: ApiAvatarInterface) {
    fun receivePlayerJoin(): Observable<PlayerInfo> {
        return Observable.create { emitter ->
            lobbySocketService.receivePlayerJoin().subscribe{
                var avatar: Bitmap? = null
                if(it.avatar != null){
                    val resAvatar = sessionManager.request(it.avatar, apiAvatarInterface::getAvatar)
                    if(resAvatar.code() == HttpsURLConnection.HTTP_OK)
                        avatar = BitmapFactory.decodeStream(resAvatar.body()!!.byteStream())
                }
                emitter.onNext(it.toPlayerInfo(avatar))
            }
        }
    }

    fun receivePlayerLeave(): Observable<String>{
        return lobbySocketService.receivePlayerLeave()
    }

    fun receivedAllLobbies(gameMode: GameType, difficulty: Difficulty) : Observable<LobbyList>{
        return lobbySocketService.receiveAllLobbies(gameMode,difficulty)
    }

    fun leaveLobby(){
        lobbySocketService.leaveLobby()
    }

    fun receiveJoinedLobbyInfo() : Observable<ArrayList<PlayerInfo>>{
        return Observable.create { emitter ->
            lobbySocketService.receiveJoinedLobbyInfo().subscribe{
                val list = ArrayList<PlayerInfo>()
                for(player in it){
                    var avatar: Bitmap? = null
                    if(player.avatar != null){
                        val res = sessionManager.request(player.avatar, apiAvatarInterface::getAvatar)
                        if(res.code() == HttpsURLConnection.HTTP_OK){
                            avatar = BitmapFactory.decodeStream(res.body()!!.byteStream())
                        }
                    }
                    list.add(player.toPlayerInfo(avatar))
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

    fun receiveStartGame() : Observable<ArrayList<PlayerRole>>{
        return lobbySocketService.receiveStartGame()
    }

    fun getUserInfo(): AccountInfo{
        return sessionManager.getAccountInfo()
    }
}