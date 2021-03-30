package com.projet.clientleger.ui.mainmenu

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.projet.clientleger.data.api.model.Difficulty
import com.projet.clientleger.data.api.model.GameType
import com.projet.clientleger.data.repository.MainmenuRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class MainMenuViewModel @Inject constructor(private val mainmenuRepository: MainmenuRepository): ViewModel(){

    fun connectSocket(accessToken: String){
        mainmenuRepository.connectSocket(accessToken)
    }
    fun createGame(lobbyName:String, gameMode:GameType,difficulty:Difficulty,isPrivate:Boolean){
        mainmenuRepository.createGame(lobbyName, gameMode,difficulty,isPrivate)
    }
    fun getUsername():String{
        return mainmenuRepository.getUsername()
    }
}