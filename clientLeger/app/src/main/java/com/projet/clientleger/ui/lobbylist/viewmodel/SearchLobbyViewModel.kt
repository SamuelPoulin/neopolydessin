package com.projet.clientleger.ui.lobbylist.viewmodel

import androidx.lifecycle.ViewModel
import com.projet.clientleger.data.enumData.Difficulty
import com.projet.clientleger.data.enumData.GameType
import com.projet.clientleger.data.model.LobbyList
import com.projet.clientleger.data.model.lobby.PlayerInfo
import com.projet.clientleger.data.repository.LobbyRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import io.reactivex.rxjava3.core.Observable

@HiltViewModel
class SearchLobbyViewModel @Inject constructor(private val lobbyRepository: LobbyRepository):ViewModel() {
    fun receiveAllLobbies(gameType: GameType, difficulty: Difficulty) : Observable<LobbyList>{
        return lobbyRepository.receivedAllLobbies(gameType, difficulty)
    }

    fun receiveJoinedLobbyInfo() : Observable<ArrayList<PlayerInfo>>{
        return lobbyRepository.receiveJoinedLobbyInfo()
    }

    fun joinLobby(lobbyId: String){
        lobbyRepository.joinLobby(lobbyId)
    }
}