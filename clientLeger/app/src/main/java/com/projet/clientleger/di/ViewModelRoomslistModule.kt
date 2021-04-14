package com.projet.clientleger.di

import com.projet.clientleger.data.api.socket.RoomslistSocketService
import com.projet.clientleger.data.repository.RoomslistRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.components.ViewModelComponent
import dagger.hilt.android.scopes.ViewModelScoped

@Module
@InstallIn(ViewModelComponent::class)
object ViewModelRoomslistModule {

    @Provides
    @ViewModelScoped
    fun provideRepo(roomslistSocketService: RoomslistSocketService): RoomslistRepository = RoomslistRepository(roomslistSocketService)
}