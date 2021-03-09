package com.projet.clientleger.di

import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.ApiRegisterInterface
import com.projet.clientleger.data.repository.RegisterRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.components.ViewModelComponent
import dagger.hilt.android.scopes.ViewModelScoped

@Module
@InstallIn(ViewModelComponent::class)
object ViewModelRegisterModule {

    @Provides
    @ViewModelScoped
    fun provideRepo(sessionManager: SessionManager, apiRegisterInterface: ApiRegisterInterface) = RegisterRepository(sessionManager, apiRegisterInterface)
}