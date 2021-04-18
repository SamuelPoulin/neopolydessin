package com.projet.clientleger.ui.mainmenu

import android.app.Activity
import android.content.Context
import android.view.View
import androidx.lifecycle.ViewModel
import com.projet.clientleger.data.api.model.SequenceModel
import com.projet.clientleger.data.enumData.Difficulty
import com.projet.clientleger.data.enumData.GameType
import com.projet.clientleger.data.repository.MainmenuRepository
import com.projet.clientleger.data.service.AudioService
import com.projet.clientleger.data.service.TutorialService
import com.projet.clientleger.ui.mainmenu.view.MainmenuActivity
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

@HiltViewModel
class MainMenuViewModel @Inject constructor(private val mainmenuRepository: MainmenuRepository, private val tutorialService: TutorialService, private val audioService: AudioService): ViewModel(){



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
    fun isTutorialActive():Boolean{
        return tutorialService.isTutorialActive()
    }
    fun addShowcase(model:SequenceModel){
        tutorialService.userGuide(model)
    }
    fun createShowcaseSequence(models:ArrayList<SequenceModel>){
        tutorialService.createShowcaseSequence(models)
    }
    fun setupAudio(context: Context){
        audioService.setupAudio(context)
    }
    fun playSound(soundId:Int){
        audioService.playSound(soundId)
    }
}