package com.projet.clientleger.ui.lobbylist.viewmodel

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.projet.clientleger.data.enumData.Difficulty
import com.projet.clientleger.data.enumData.GameType
import com.projet.clientleger.data.model.lobby.LobbyInfo
import com.projet.clientleger.data.model.lobby.PlayerInfo
import com.projet.clientleger.data.repository.LobbyRepository
import com.projet.clientleger.data.service.AudioService
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import io.reactivex.rxjava3.core.Observable

@HiltViewModel
class SearchLobbyViewModel @Inject constructor(private val lobbyRepository: LobbyRepository, private val audioService: AudioService) : ViewModel() {
    val displayedLobbies: MutableLiveData<ArrayList<LobbyInfo>> = MutableLiveData(ArrayList())
    var selectedGameType: GameType? = null
    var selectedDifficulty: Difficulty? = null
    var lobbies: ArrayList<LobbyInfo> = ArrayList()

    fun init() {
        lobbyRepository.receiveUpdateLobbyList().subscribe {
            lobbies = it
            filterLobbies()
        }
        lobbyRepository.receivedAllLobbies(selectedGameType, selectedDifficulty).subscribe {
            lobbies = it
            filterLobbies()
        }
    }

    fun filterLobbies() {
        val filteredLobbies = ArrayList<LobbyInfo>()
        filteredLobbies.addAll(lobbies)
        if (selectedDifficulty != null)
            filteredLobbies.removeIf { it.difficulty != selectedDifficulty }
        if (selectedGameType != null)
            filteredLobbies.removeIf { it.gameType != selectedGameType }
        displayedLobbies.postValue(filteredLobbies)
    }

    fun unsubscribe() {
        lobbyRepository.unsubscribeLobbyList()
    }

    fun playSound(soundId: Int) {
        audioService.playSound(soundId)
    }

}