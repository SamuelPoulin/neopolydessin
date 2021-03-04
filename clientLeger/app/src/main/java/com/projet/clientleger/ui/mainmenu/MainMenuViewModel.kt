package com.projet.clientleger.ui.mainmenu

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.projet.clientleger.data.repository.MainmenuRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class MainMenuViewModel @Inject constructor(private val mainmenuRepository: MainmenuRepository): ViewModel(){
    lateinit var accessToken: String
    lateinit var refreshToken:String
    fun connectUser(){
        viewModelScope.launch {
            val res = mainmenuRepository.login()
            accessToken = res.accessToken
            refreshToken = res.refreshToken
            mainmenuRepository.connectSocket(accessToken)
        }
    }
}