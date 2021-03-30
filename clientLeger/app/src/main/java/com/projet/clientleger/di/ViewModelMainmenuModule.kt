package com.projet.clientleger.di

import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.http.ApiMainmenuInterface
import com.projet.clientleger.data.api.socket.LobbySocketService
import com.projet.clientleger.data.api.socket.SocketService
import com.projet.clientleger.data.repository.MainmenuRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.components.ViewModelComponent
import dagger.hilt.android.scopes.ViewModelScoped

@Module
@InstallIn(ViewModelComponent::class)
object ViewModelMainmenuModule {

    @Provides
    @ViewModelScoped
    fun provideRepo(apiMainmenuInterface: ApiMainmenuInterface, socketService: SocketService, lobbySocketService: LobbySocketService, sessionManager: SessionManager) = MainmenuRepository(socketService, apiMainmenuInterface, lobbySocketService, sessionManager)
}