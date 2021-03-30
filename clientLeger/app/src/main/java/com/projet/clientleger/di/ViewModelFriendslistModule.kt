package com.projet.clientleger.di

import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.http.ApiFriendslistInterface
import com.projet.clientleger.data.api.socket.FriendslistSocketService
import com.projet.clientleger.data.repository.FriendslistRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.components.ViewModelComponent
import dagger.hilt.android.scopes.ViewModelScoped

@Module
@InstallIn(ViewModelComponent::class)
object ViewModelFriendslistModule {

    @Provides
    @ViewModelScoped
    fun provideRepo(socketService: FriendslistSocketService, sessionManager: SessionManager, apiFriendslistInterface: ApiFriendslistInterface) = FriendslistRepository(socketService, sessionManager, apiFriendslistInterface)
}