package com.projet.clientleger.di

import com.projet.clientleger.data.api.service.DrawingSocketService
import com.projet.clientleger.data.api.service.SocketService
import com.projet.clientleger.data.repository.DrawboardRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.components.ViewModelComponent
import dagger.hilt.android.scopes.ViewModelScoped

@Module
@InstallIn(ViewModelComponent::class)
object ViewModelDrawboardModule {

    @Provides
    @ViewModelScoped
    fun provideRepo(drawingSocketService: DrawingSocketService) = DrawboardRepository(drawingSocketService)
}