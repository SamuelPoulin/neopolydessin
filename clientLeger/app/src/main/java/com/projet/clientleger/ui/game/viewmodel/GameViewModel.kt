package com.projet.clientleger.ui.game.viewmodel

import androidx.fragment.app.FragmentManager
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.projet.clientleger.data.api.model.Timer
import com.projet.clientleger.data.api.model.lobby.Player
import com.projet.clientleger.data.enumData.PlayerRole
import com.projet.clientleger.data.model.account.AccountInfo
import com.projet.clientleger.data.model.lobby.PlayerInfo
import com.projet.clientleger.data.repository.GameRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import io.reactivex.rxjava3.core.Observable
import javax.inject.Inject

@HiltViewModel
class GameViewModel @Inject constructor(private val gameRepository: GameRepository): ViewModel() {
    private lateinit var fragmentManager: FragmentManager
    val currentRoleLiveData: MutableLiveData<PlayerRole> = MutableLiveData()
    val playersLiveData: MutableLiveData<ArrayList<PlayerInfo>> = MutableLiveData(ArrayList())
    val activeWord: MutableLiveData<String> = MutableLiveData()
    val activeTimer: MutableLiveData<Long> = MutableLiveData()
    val accountInfo = gameRepository.getAccountInfo()
    fun init(fragmentManager: FragmentManager){
        this.fragmentManager = fragmentManager

        gameRepository.receiveRoles().subscribe{
            playersLiveData.postValue(it)
            updateCurrentRole(it)
        }

        gameRepository.receiveKeyWord().subscribe{activeWord.postValue(it)}

        gameRepository.receiveTimer().subscribe{
            val timer = System.currentTimeMillis() - it.serverTime + it.timestamp
            activeTimer.postValue(findTimeLeft(timer)) }

    }
    private fun findTimeLeft(finishTime:Long):Long{
        return finishTime - System.currentTimeMillis()
    }
    fun onPlayerReady(){
        gameRepository.onPlayerReady()
    }
    private fun updateCurrentRole(players:ArrayList<PlayerInfo>){
        for(player in players){
            if(accountInfo.username == player.username){
                currentRoleLiveData.postValue(player.playerRole)
            }
        }
    }
    fun receiveEndGameNotice():Observable<String>{
        return gameRepository.receiveEndGameNotice()
    }
    fun unsubscribe(){
        gameRepository.unsubscribe()
    }
}