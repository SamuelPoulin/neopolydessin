package com.projet.clientleger.di

import com.projet.clientleger.data.api.ApiConnectionInterface
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
    fun provideRepo(apiConnectionInterface: ApiConnectionInterface) = ConnectionRepository(apiConnectionInterface)
}