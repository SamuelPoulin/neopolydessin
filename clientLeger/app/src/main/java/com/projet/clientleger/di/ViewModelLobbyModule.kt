package com.projet.clientleger.di

import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.http.ApiAvatarInterface
import com.projet.clientleger.data.api.socket.LobbySocketService
import com.projet.clientleger.data.repository.LobbyRepository
import com.projet.clientleger.data.service.AvatarStorageService
import com.projet.clientleger.data.service.ChatStorageService
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.components.ViewModelComponent
import dagger.hilt.android.scopes.ViewModelScoped

@Module
@InstallIn(ViewModelComponent::class)
object ViewModelLobbyModule {
    @Provides
    @ViewModelScoped
    fun provideRepo(lobbySocketService: LobbySocketService, sessionManager: SessionManager, avatarStorageService: AvatarStorageService) = LobbyRepository(lobbySocketService, sessionManager, avatarStorageService)
}