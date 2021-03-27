package com.projet.clientleger.di

import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.service.LobbySocketService
import com.projet.clientleger.data.api.service.SocketService
import com.projet.clientleger.data.repository.LobbyRepository
import com.projet.clientleger.ui.lobbylist.viewmodel.SearchLobbyViewModel
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.components.ViewModelComponent
import dagger.hilt.android.scopes.ViewModelScoped


/*@Module
@InstallIn(ViewModelComponent::class)
object ViewModelSearchLobbyModule {

    /*@Provides
    @ViewModelScoped
    fun provideRepo(sessionManager: SessionManager, lobbySocketService: LobbySocketService, socketService: SocketService) = LobbyRepository(sessionManager,lobbySocketService,socketService)*/
}*/