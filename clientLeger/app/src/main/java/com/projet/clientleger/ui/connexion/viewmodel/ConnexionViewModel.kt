package com.projet.clientleger.ui.connexion.viewmodel

import android.content.Context
import androidx.lifecycle.ViewModel
import com.projet.clientleger.data.api.model.ConnectionModel
import com.projet.clientleger.data.api.model.RegisterResponse
import com.projet.clientleger.data.repository.ConnectionRepository
import com.projet.clientleger.data.service.AudioService
import dagger.hilt.android.lifecycle.HiltViewModel
import io.reactivex.rxjava3.core.Observable
import javax.inject.Inject

@HiltViewModel
class ConnexionViewModel @Inject constructor(private val connectionRepository: ConnectionRepository, private val audioService: AudioService):ViewModel() {
    suspend fun connectAccount(username:String, password:String): Observable<RegisterResponse> {
        val model = ConnectionModel(
                username,
                password,
        )
        return connectionRepository.connectAccount(model)
    }
    fun setupAudio(context: Context){
        audioService.setupAudio(context)
    }
    fun playSound(soundId:Int){
        audioService.playSound(soundId)
    }
}