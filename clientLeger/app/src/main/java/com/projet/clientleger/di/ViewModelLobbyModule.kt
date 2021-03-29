package com.projet.clientleger.di

import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.socket.LobbySocketService
import com.projet.clientleger.data.repository.LobbyRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.components.ViewModelComponent

@Module
@InstallIn(ViewModelComponent::class)
object ViewModelLobbyModule {
    @Provides
    //@ViewModelScoped
    fun provideRepo(lobbySocketService: LobbySocketService, sessionManager: SessionManager) = LobbyRepository(lobbySocketService, sessionManager)
}