package com.projet.clientleger.ui.lobby.viewmodel

import android.app.Activity
import android.graphics.Bitmap
import android.view.View
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.projet.clientleger.data.api.model.SequenceModel
import com.projet.clientleger.data.enumData.Difficulty
import com.projet.clientleger.data.enumData.GameType
import com.projet.clientleger.data.enumData.TabType
import com.projet.clientleger.data.model.account.AccountInfo
import com.projet.clientleger.data.model.chat.TabInfo
import com.projet.clientleger.data.model.lobby.LobbyInfo
import com.projet.clientleger.data.model.lobby.PlayerInfo
import com.projet.clientleger.data.repository.LobbyRepository
import com.projet.clientleger.data.service.AudioService
import com.projet.clientleger.data.service.TutorialService
import com.projet.clientleger.ui.chat.ChatViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import io.reactivex.rxjava3.core.Observable
import javax.inject.Inject

@HiltViewModel
class LobbyViewModel @Inject constructor(private val lobbyRepository: LobbyRepository,private val audioService: AudioService):ViewModel() {

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
    val isPrivate: MutableLiveData<Boolean> = MutableLiveData()
    lateinit var lobbyId: String
    val userIsOwner: MutableLiveData<Boolean> = MutableLiveData(false)

    init {
        lobbyRepository.receiveJoinedLobbyInfo().subscribe{
            updatePlayers(it)
        }
        lobbyRepository.receivePrivacySetting().subscribe{
            isPrivate.postValue(it)
        }
    }

    fun getAccountInfo(): AccountInfo{
        return lobbyRepository.accountInfo
    }

    fun createGame(): Observable<LobbyInfo> {
        return lobbyRepository.createGame(gameName, gameType, difficulty, isPrivate.value!!)
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
                if(player.avatar == null)
                    player.avatar = defaultImage
                teams[player.teamNumber].value!!.add(player)
        }
        addBotAddBtn(userIsOwner.value!!, true)
        teams[0].postValue(teams[0].value!!)
        teams[1].postValue(teams[1].value!!)
    }

    fun updateOwner(owner: PlayerInfo){
        val oldValue = userIsOwner.value
        val newValue = owner.accountId == getAccountInfo().accountId
        userIsOwner.postValue(newValue)
        if(oldValue != newValue)
            addBotAddBtn(newValue, false)
    }

    private fun addBotAddBtn(isOwner: Boolean, isInUpdate: Boolean){
        if(isOwner){
            for((index, team) in teams.withIndex()) {
                val teamArray = team.value!!
                if(teamArray.size < 2 && teamArray.find { it.isBot } == null && teamArray.find { it.username.isEmpty() && it.accountId.isEmpty()} == null)
                    teamArray.add(PlayerInfo(teamNumber = index))
                if(!isInUpdate)
                    team.postValue(teamArray)
            }
        }
    }

    fun joinLobby(): Observable<LobbyInfo> {
        return lobbyRepository.joinLobby(lobbyId)
    }

    fun receiveJoinedLobbyInfo(): Observable<ArrayList<PlayerInfo>> {
        return lobbyRepository.receiveJoinedLobbyInfo()
    }

    fun clearAvatarStorage(){
        lobbyRepository.clearAvatarStorage()
    }

    fun kickPlayer(playerId: String){
        lobbyRepository.kickPlayer(playerId)
    }
    fun playSound(soundId:Int){
        audioService.playSound(soundId)
    }

    fun receiveKick(): Observable<Unit> {
        return lobbyRepository.receiveKick()
    }

    fun addBot(teamNumber: Int){
        lobbyRepository.addBot(teamNumber)
    }

    fun removeBot(username: String){
        lobbyRepository.removeBot(username)
    }

    fun togglePrivacySetting(){
        lobbyRepository.sendPrivacySetting(!isPrivate.value!!)
    }
}