package com.projet.clientleger.connexion

import com.projet.clientleger.data.repository.ConnectionRepository
import com.projet.clientleger.data.repository.RegisterRepository
import com.projet.clientleger.di.ViewModelConnectionModule
import com.projet.clientleger.di.ViewModelRegisterModule
import com.projet.clientleger.register.FakeRegisterRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.components.SingletonComponent
import dagger.hilt.testing.TestInstallIn


@Module
@TestInstallIn(components = [SingletonComponent::class],
    replaces = [ViewModelConnectionModule::class])
interface FakeConnectionViewModelModule {
    @Binds
    fun bind(impl: FakeConnectionRepository): ConnectionRepository
}