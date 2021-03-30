package com.projet.clientleger.data.repository

import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.model.PlayerRole
import com.projet.clientleger.data.api.socket.GameSocketService
import io.reactivex.rxjava3.core.Observable
import javax.inject.Inject

open class GameRepository @Inject constructor(private val gameSocketService: GameSocketService, private val sessionManager: SessionManager) {
    fun receiveTimer():Observable<Long>{
        return  gameSocketService.receiveTimer()
    }
    fun receiveRoles():Observable<Array<PlayerRole>>{
        return gameSocketService.receiveRoles()
    }
    fun receiveKeyWord():Observable<String>{
        return gameSocketService.receiveKeyWord()
    }
    fun getUsername():String{
        return sessionManager.getUsername()
    }
    fun onPlayerReady(){
        gameSocketService.onPlayerReady()
    }
}