package com.projet.clientleger.di

import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.http.ApiConnectionInterface
import com.projet.clientleger.data.repository.ConnectionRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.components.ViewModelComponent
import dagger.hilt.android.scopes.ViewModelScoped


@Module
@InstallIn(ViewModelComponent::class)
object ViewModelConnectionModule {

    @Provides
    @ViewModelScoped
    fun provideRepo(sessionManager: SessionManager, apiConnectionInterface: ApiConnectionInterface) = ConnectionRepository(sessionManager,apiConnectionInterface)
}