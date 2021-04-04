package com.projet.clientleger.ui.lobbylist.viewmodel

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.projet.clientleger.data.enumData.Difficulty
import com.projet.clientleger.data.enumData.GameType
import com.projet.clientleger.data.model.lobby.LobbyInfo
import com.projet.clientleger.data.model.lobby.PlayerInfo
import com.projet.clientleger.data.repository.LobbyRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import io.reactivex.rxjava3.core.Observable

@HiltViewModel
class SearchLobbyViewModel @Inject constructor(private val lobbyRepository: LobbyRepository):ViewModel() {
    val lobbies: MutableLiveData<ArrayList<LobbyInfo>> = MutableLiveData(ArrayList())
    lateinit var selectedGameType: GameType
    lateinit var selectedDifficulty: Difficulty

    fun init() {
        lobbyRepository.receiveUpdateLobbyList().subscribe {
            filterLobbies(it)
            lobbies.postValue(it)
        }
        lobbyRepository.receivedAllLobbies(selectedGameType, selectedDifficulty).subscribe{
            lobbies.postValue(it)
        }
    }

    fun receiveAllLobbies(gameType: GameType, difficulty: Difficulty) : Observable<ArrayList<LobbyInfo>>{
        return lobbyRepository.receivedAllLobbies(gameType, difficulty)
    }

    fun receiveJoinedLobbyInfo() : Observable<ArrayList<PlayerInfo>>{
        return lobbyRepository.receiveJoinedLobbyInfo()
    }

    fun joinLobby(lobbyId: String){
        lobbyRepository.joinLobby(lobbyId)
    }

    fun filterLobbies(unfilteredLobbies: ArrayList<LobbyInfo>){
        unfilteredLobbies.removeIf {it.difficulty != selectedDifficulty || it.gameType != selectedGameType}
    }
    fun unsubscribe(){
        lobbyRepository.unsubscribeLobbyList()
    }
}