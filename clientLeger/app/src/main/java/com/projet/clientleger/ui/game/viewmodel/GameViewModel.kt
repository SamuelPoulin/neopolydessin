package com.projet.clientleger.ui.game.viewmodel

import androidx.lifecycle.ViewModel
import com.projet.clientleger.data.api.model.PlayerRole
import com.projet.clientleger.data.repository.GameRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import io.reactivex.rxjava3.core.Observable
import javax.inject.Inject

@HiltViewModel
class GameViewModel @Inject constructor(private val gameRepository: GameRepository): ViewModel() {
    fun receiveTimer(): Observable<Long> {
        return gameRepository.receiveTimer()
    }
    fun receiveRoles(): Observable<Array<PlayerRole>> {
        return gameRepository.receiveRoles()
    }
    fun receiveKeyWord(): Observable<String> {
        return gameRepository.receiveKeyWord()
    }
    fun getUsername(): String{
        return gameRepository.getUsername()
    }
    fun onPlayerReady(){
        gameRepository.onPlayerReady()
    }

}