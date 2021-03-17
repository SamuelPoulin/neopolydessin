package com.projet.clientleger.di

import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.ApiMainmenuInterface
import com.projet.clientleger.data.api.service.LobbySocketService
import com.projet.clientleger.data.api.service.SocketService
import com.projet.clientleger.data.repository.LobbyRepository
import com.projet.clientleger.data.repository.MainmenuRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.components.ViewModelComponent
import dagger.hilt.android.scopes.ViewModelScoped

@Module
@InstallIn(ViewModelComponent::class)
object ViewModelLobbyModule {
    @Provides
    //@ViewModelScoped
    fun provideRepo(lobbySocketService: LobbySocketService) = LobbyRepository(lobbySocketService)
}