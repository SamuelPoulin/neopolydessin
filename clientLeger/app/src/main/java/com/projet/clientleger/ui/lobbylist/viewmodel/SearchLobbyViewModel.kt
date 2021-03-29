package com.projet.clientleger.ui.lobbylist.viewmodel

import androidx.lifecycle.ViewModel
import com.projet.clientleger.data.api.model.Difficulty
import com.projet.clientleger.data.api.model.GameType
import com.projet.clientleger.data.api.model.LobbyInfo
import com.projet.clientleger.data.model.LobbyList
import com.projet.clientleger.data.repository.LobbyRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import io.reactivex.rxjava3.core.Observable

@HiltViewModel
class SearchLobbyViewModel @Inject constructor(private val lobbyRepository: LobbyRepository):ViewModel() {
    fun receiveAllLobbies(gameMode: GameType, difficulty: Difficulty) : Observable<LobbyList>{
        return lobbyRepository.receivedAllLobbies(gameMode, difficulty)
    }

    fun receiveJoinedLobbyInfo() : Observable<LobbyInfo>{
        return lobbyRepository.receiveJoinedLobbyInfo()
    }

    fun joinLobby(lobbyId: String){
        lobbyRepository.joinLobby(lobbyId)
    }
}