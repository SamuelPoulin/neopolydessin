package com.projet.clientleger

import com.projet.clientleger.connexion.FakeApiSessionManagerInterface
import com.projet.clientleger.connexion.FakeSessionManager
import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.TokenInterceptor
import com.projet.clientleger.di.ApiInterfacesModule
import com.projet.clientleger.di.SessionManagerModule
import dagger.Binds
import dagger.Module
import dagger.hilt.components.SingletonComponent
import dagger.hilt.testing.TestInstallIn

@Module
@TestInstallIn(components = [SingletonComponent::class],
    replaces = [SessionManagerModule::class])
interface FakeSessionManagerModule {
    @Binds fun bindSessionManager(iml: FakeSessionManager) : SessionManager
}