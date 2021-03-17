package com.projet.clientleger.ui.lobby.viewmodel

import androidx.lifecycle.ViewModel
import com.projet.clientleger.data.api.model.Difficulty
import com.projet.clientleger.data.api.model.GameType
import com.projet.clientleger.data.repository.LobbyRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import io.reactivex.rxjava3.core.Observable
import javax.inject.Inject

@HiltViewModel
class LobbyViewModel @Inject constructor(private val lobbyRepository: LobbyRepository):ViewModel() {
    fun receivePlayersInfo(): Observable<String> {
        return lobbyRepository.receivedPlayersInfo()
    }
}