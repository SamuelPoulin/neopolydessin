package com.projet.clientleger.ui.game.viewmodel

import androidx.fragment.app.FragmentManager
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.projet.clientleger.data.api.model.PlayerRole
import com.projet.clientleger.data.repository.GameRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import io.reactivex.rxjava3.core.Observable
import javax.inject.Inject

@HiltViewModel
class GameViewModel @Inject constructor(private val gameRepository: GameRepository): ViewModel() {
    private lateinit var fragmentManager: FragmentManager
    private var currentRoleLiveData: MutableLiveData<>
    fun init(fragmentManager: FragmentManager){
        this.fragmentManager = fragmentManager

    }
    fun receiveTimer(): Observable<Long> {
        return gameRepository.receiveTimer()
    }
    fun receiveRoles(): Observable<Array<PlayerRole>> {
        return gameRepository.receiveRoles().subscribe{ roles ->

        }
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