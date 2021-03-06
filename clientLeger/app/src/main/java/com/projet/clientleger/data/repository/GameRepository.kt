package com.projet.clientleger.data.repository

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.model.TeamScore
import com.projet.clientleger.data.api.model.Timer
import com.projet.clientleger.data.api.model.lobby.Player
import com.projet.clientleger.data.api.socket.GameSocketService
import com.projet.clientleger.data.enumData.GameState
import com.projet.clientleger.data.model.account.AccountInfo
import com.projet.clientleger.data.model.lobby.PlayerInfo
import com.projet.clientleger.data.service.ChatStorageService
import io.reactivex.rxjava3.core.Observable
import javax.inject.Inject
import javax.net.ssl.HttpsURLConnection

open class GameRepository @Inject constructor(private val gameSocketService: GameSocketService,
                                              private val sessionManager: SessionManager) {
    fun receiveTimer():Observable<Timer>{
        return  gameSocketService.receiveTimer()
    }
    fun receiveRoles():Observable<ArrayList<PlayerInfo>>{
        return Observable.create { emitter ->
            gameSocketService.receiveRoles().subscribe{
                val list = ArrayList<PlayerInfo>()
                for(player in it){
                    list.add(player.toPlayerInfo(null))
                }
                emitter.onNext(list)
            }
        }
    }
    fun receiveKeyWord():Observable<String>{
        return gameSocketService.receiveKeyWord()
    }

    fun getAccountInfo():AccountInfo{
        return sessionManager.getAccountInfo()
    }

    fun onPlayerReady(){
        gameSocketService.onPlayerReady()
    }

    fun receiveEndGameNotice():Observable<String>{
        return gameSocketService.receiveEndGameNotice()
    }

    fun unsubscribe(){
        gameSocketService.unsubscribe()
    }

    fun receiveTeamScores():Observable<ArrayList<TeamScore>>{
        return gameSocketService.receiveTeamScores()
    }

    fun receiveGameState(): Observable<GameState?> {
        return Observable.create{ emitter ->
            gameSocketService.receiveGameState().subscribe{
                emitter.onNext(GameState.stringToEnum(it))
            }
        }
    }

    fun onLeaveGame() {
        gameSocketService.onLeaveGame()
    }

    fun getUsername():String{
        return sessionManager.getUsername()
    }
}