package com.projet.clientleger.ui.connexion.viewmodel

import androidx.lifecycle.ViewModel
import com.projet.clientleger.data.api.model.ConnectionModel
import com.projet.clientleger.data.api.model.RegisterResponse
import com.projet.clientleger.data.repository.ConnectionRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

class ConnexionViewModel @Inject constructor(private val connectionRepository: ConnectionRepository):ViewModel() {

    suspend fun connectAccount(username:String, password:String):RegisterResponse{
        val model = ConnectionModel(
                username,
                password,
        )
        return connectionRepository.connectAccount(model)
    }
}