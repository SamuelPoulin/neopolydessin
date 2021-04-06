package com.projet.clientleger.ui.lobby.viewmodel

import android.graphics.Bitmap
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.projet.clientleger.data.enumData.Difficulty
import com.projet.clientleger.data.enumData.GameType
import com.projet.clientleger.data.model.account.AccountInfo
import com.projet.clientleger.data.model.lobby.LobbyInfo
import com.projet.clientleger.data.model.lobby.PlayerInfo
import com.projet.clientleger.data.repository.LobbyRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import io.reactivex.rxjava3.core.Observable
import javax.inject.Inject

@HiltViewModel
class LobbyViewModel @Inject constructor(private val lobbyRepository: LobbyRepository):ViewModel() {

    companion object {
        const val GAME_TAB_NAME = "Partie"
    }

    val teams: Array<MutableLiveData<ArrayList<PlayerInfo>>> =
            arrayOf(MutableLiveData(ArrayList()),
            MutableLiveData(ArrayList()))
    lateinit var defaultImage: Bitmap
    lateinit var gameType: GameType
    lateinit var difficulty: Difficulty
    lateinit var gameName: String
    var isPrivate: Boolean = false
    lateinit var lobbyId: String

    init {
        lobbyRepository.receiveJoinedLobbyInfo().subscribe{
            updatePlayers(it)
        }
    }

    fun getAccountInfo(): AccountInfo{
        return lobbyRepository.getAccountInfo()
    }

    fun createGame() {
        lobbyRepository.createGame(gameName, gameType, difficulty, isPrivate)
    }

    fun unsubscribe(){
        lobbyRepository.unsubscribeLobby()
    }

    fun startGame(){
        lobbyRepository.startGame()
    }

    fun leaveLobby(){
        lobbyRepository.leaveLobby()
    }

    fun receiveStartGame(): Observable<String>{
        return lobbyRepository.receiveStartGame()
    }

    private fun updatePlayers(list: ArrayList<PlayerInfo>){
        teams[0].value!!.clear()
        teams[1].value!!.clear()

        for(i in 0 until list.size){
            val player = list[i]
            if(!(gameType != GameType.CLASSIC && player.isBot)){
                if(player.avatar == null)
                    player.avatar = defaultImage
                teams[player.teamNumber].value!!.add(player)
            }
        }
        teams[0].postValue(teams[0].value!!)
        teams[1].postValue(teams[1].value!!)
    }


    fun joinGame(){
        lobbyRepository.joinLobby(lobbyId)
    }

    fun receiveJoinedLobbyInfo(): Observable<ArrayList<PlayerInfo>> {
        return lobbyRepository.receiveJoinedLobbyInfo()
    }

    fun clearAvatarStorage(){
        lobbyRepository.clearAvatarStorage()
    }

    fun kickPlayer(){
        lobbyRepository.kickPlayer()
    }
}