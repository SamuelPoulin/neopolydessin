package com.projet.clientleger.data.repository

import com.projet.clientleger.data.api.model.PlayerRole
import com.projet.clientleger.data.api.service.GameSocketService
import io.reactivex.rxjava3.core.Observable
import javax.inject.Inject

open class GameRepository @Inject constructor(private val gameSocketService: GameSocketService) {
    fun receiveTimer():Observable<Long>{
        return  gameSocketService.receiveTimer()
    }
    fun receiveRoles():Observable<Array<PlayerRole>>{
        return gameSocketService.receiveRoles()
    }
    fun receiveKeyWord():Observable<String>{
        return gameSocketService.receiveKeyWord()
    }
}