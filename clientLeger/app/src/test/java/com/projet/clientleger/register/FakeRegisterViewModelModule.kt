package com.projet.clientleger.register

import com.projet.clientleger.data.repository.RegisterRepository
import com.projet.clientleger.di.ViewModelRegisterModule
import dagger.Binds
import dagger.Module
import dagger.hilt.components.SingletonComponent
import dagger.hilt.testing.TestInstallIn

@Module
@TestInstallIn(components = [SingletonComponent::class],
    replaces = [ViewModelRegisterModule::class])
interface FakeRegisterViewModelModule {
    @Binds fun bind(impl: FakeRegisterRepository): RegisterRepository
}