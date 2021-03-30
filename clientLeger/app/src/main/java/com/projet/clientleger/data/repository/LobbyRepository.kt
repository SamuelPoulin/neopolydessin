package com.projet.clientleger.data.repository

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.http.ApiAvatarInterface
import com.projet.clientleger.data.api.model.Difficulty
import com.projet.clientleger.data.api.model.GameType
import com.projet.clientleger.data.api.model.PlayerRole
import com.projet.clientleger.data.api.socket.LobbySocketService
import com.projet.clientleger.data.model.LobbyList
import com.projet.clientleger.data.model.lobby.PlayerInfo
import io.reactivex.rxjava3.core.Observable
import javax.inject.Inject
import javax.net.ssl.HttpsURLConnection

class LobbyRepository @Inject constructor(private val lobbySocketService: LobbySocketService,
                                          private val sessionManager: SessionManager,
                                          private val apiAvatarInterface: ApiAvatarInterface) {
    fun receivedPlayersInfo(): Observable<String> {
        return lobbySocketService.receivePlayersInfo()
    }
    fun receivedAllLobbies(gameMode: GameType, difficulty: Difficulty) : Observable<LobbyList>{
        return lobbySocketService.receiveAllLobbies(gameMode,difficulty)
    }

    fun receiveJoinedLobbyInfo() : Observable<ArrayList<PlayerInfo>>{
        return Observable.create { emitter ->
            lobbySocketService.receiveJoinedLobbyInfo().subscribe{
                val list = ArrayList<PlayerInfo>()
                for(player in it){
                    val avatar: Bitmap? = null
                    if(player.avatar != null){
                        val res = sessionManager.request(player.avatar, apiAvatarInterface::getAvatar)
                        if(res.code() == HttpsURLConnection.HTTP_OK){
                            BitmapFactory.decodeStream(res.body()!!.byteStream())
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
}