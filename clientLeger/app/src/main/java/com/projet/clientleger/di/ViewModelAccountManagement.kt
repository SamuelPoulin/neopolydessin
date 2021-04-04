package com.projet.clientleger.di

import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.socket.AccountManagementSocketService
import com.projet.clientleger.data.repository.AccountManagementRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.components.ViewModelComponent
import dagger.hilt.android.scopes.ViewModelScoped

@Module
@InstallIn(ViewModelComponent::class)
object ViewModelAccountManagement {
    @Provides
    @ViewModelScoped
    fun provideRepo(accountManagementSocketService: AccountManagementSocketService, sessionManager: SessionManager) = AccountManagementRepository(accountManagementSocketService, sessionManager)
}