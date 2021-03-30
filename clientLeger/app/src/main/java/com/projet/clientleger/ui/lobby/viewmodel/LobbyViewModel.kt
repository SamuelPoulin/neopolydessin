package com.projet.clientleger.ui.lobby.viewmodel

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.projet.clientleger.data.api.model.PlayerRole
import com.projet.clientleger.data.api.model.lobby.Player
import com.projet.clientleger.data.model.lobby.PlayerInfo
import com.projet.clientleger.data.repository.LobbyRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import io.reactivex.rxjava3.core.Observable
import javax.inject.Inject

@HiltViewModel
class LobbyViewModel @Inject constructor(private val lobbyRepository: LobbyRepository):ViewModel() {
    val teams: Array<MutableLiveData<ArrayList<PlayerInfo>>> =
            arrayOf(MutableLiveData(ArrayList()),
            MutableLiveData(ArrayList()))

    init {
        lobbyRepository.receiveJoinedLobbyInfo().subscribe{
            updatePlayers(it)
        }
    }

    fun receivePlayersInfo(): Observable<String> {
        return lobbyRepository.receivedPlayersInfo()
    }

    fun startGame(){
        lobbyRepository.startGame()
    }

    fun receiveStartGame(): Observable<ArrayList<PlayerRole>>{
        return lobbyRepository.receiveStartGame()
    }
    fun getUsername(): String{
        return lobbyRepository.getUsername()
    }

    fun fillTeams(defaultImage: Bitmap){
        for(team in teams){
            for (i in 0 until 2) {
                team.value!!.add(PlayerInfo(avatar = defaultImage))
            }
        }
        teams[0].postValue(teams[0].value!!)
        teams[1].postValue(teams[1].value!!)
    }

    private fun updatePlayers(list: ArrayList<PlayerInfo>){
        teams[0].value!!.clear()
        teams[1].value!!.clear()
        for(i in 0 until list.size){
            teams[list[i].teamNumber].value!!.add(list[i])
        }
        for(team in teams){
            for(i in 1 downTo team.value!!.size)
                team.value!!.add(PlayerInfo())
        }
        teams[0].postValue(teams[0].value!!)
        teams[1].postValue(teams[1].value!!)
    }

    fun setUserInfo(){
        val info = lobbyRepository.getUserInfo()
        teams[0].value!![0] = PlayerInfo(0, info.username, info.accountId, info.avatar)
        teams[0].postValue(teams[0].value!!)
    }
}