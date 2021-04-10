package com.projet.clientleger.ui.mainmenu

import android.view.View
import androidx.lifecycle.ViewModel
import com.projet.clientleger.data.enumData.Difficulty
import com.projet.clientleger.data.enumData.GameType
import com.projet.clientleger.data.repository.MainmenuRepository
import com.projet.clientleger.data.service.TutorialService
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

@HiltViewModel
class MainMenuViewModel @Inject constructor(private val mainmenuRepository: MainmenuRepository, private val tutorialService: TutorialService): ViewModel(){

    fun connectSocket(accessToken: String){
        mainmenuRepository.connectSocket(accessToken)
    }
    fun createGame(lobbyName:String, gameMode: GameType, difficulty: Difficulty, isPrivate:Boolean){
        mainmenuRepository.createGame(lobbyName, gameMode,difficulty,isPrivate)
    }
    fun getUsername():String{
        return mainmenuRepository.getUsername()
    }
    fun disconnect(){
        mainmenuRepository.disconnect()
    }
    /*fun isTutorialActive():Boolean{
        return tutorialService.isTutorialActive
    }*/
    /*fun showTutorialStep(message:String, target: View){
        tutorialService.userGuide(message,target)
    }*/
}