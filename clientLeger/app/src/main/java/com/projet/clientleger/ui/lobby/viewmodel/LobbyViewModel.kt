package com.projet.clientleger.ui.lobby.viewmodel

import android.graphics.Bitmap
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.projet.clientleger.data.enumData.Difficulty
import com.projet.clientleger.data.enumData.GameType
import com.projet.clientleger.data.model.account.AccountInfo
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
    private val realPlayerTeams: Array<ArrayList<PlayerInfo>> = arrayOf(ArrayList(), ArrayList())
    lateinit var defaultImage: Bitmap
    init {
        lobbyRepository.receiveJoinedLobbyInfo().subscribe{
            updatePlayers(it)
        }
    }

    fun getAccountInfo(): AccountInfo{
        return lobbyRepository.getAccountInfo()
    }

    fun createGame(gameName: String, gameType: GameType, difficulty: Difficulty, isPrivate: Boolean) {
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

    fun getUsername(): String{
        return lobbyRepository.getUsername()
    }

//    fun fillTeams(defaultImage: Bitmap){
//        this.defaultImage = defaultImage
//        for(team in teams){
//            for (i in 0 until 2) {
//                team.value!!.add(PlayerInfo(avatar = defaultImage, isBot = true))
//            }
//        }
//        teams[0].postValue(teams[0].value!!)
//        teams[1].postValue(teams[1].value!!)
//    }

    private fun updatePlayers(list: ArrayList<PlayerInfo>){
        teams[0].value!!.clear()
        teams[1].value!!.clear()

        for (team in realPlayerTeams)
            team.clear()

        for(i in 0 until list.size){
            val player = list[i]
            if(player.avatar == null)
                player.avatar = defaultImage
            teams[player.teamNumber].value!!.add(player)
            realPlayerTeams[player.teamNumber].add(player)
        }
//        for(team in teams){
//            for(i in 1 downTo team.value!!.size)
//                team.value!!.add(PlayerInfo(avatar = defaultImage, isBot = true))
//        }
        teams[0].postValue(teams[0].value!!)
        teams[1].postValue(teams[1].value!!)
    }

    fun setUserInfo(){
        val info = lobbyRepository.getUserInfo()
        val playerInfo = PlayerInfo(info.accountId,info.username,info.avatar,teamNumber = 0)
        realPlayerTeams[0].add(playerInfo)
        teams[0].value!![0] = playerInfo
        teams[0].postValue(teams[0].value!!)
    }

    fun joinGame(lobbyId: String){
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