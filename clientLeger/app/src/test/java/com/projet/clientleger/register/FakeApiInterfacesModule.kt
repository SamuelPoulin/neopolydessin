package com.projet.clientleger.register

import com.projet.clientleger.data.api.ApiRegisterInterface
import com.projet.clientleger.di.ApiInterfacesModule
import dagger.Binds
import dagger.Module
import dagger.hilt.components.SingletonComponent
import dagger.hilt.testing.TestInstallIn

@Module
@TestInstallIn(components = [SingletonComponent::class],
    replaces = [ApiInterfacesModule::class])
interface FakeApiInterfacesModule {
    @Binds fun bind(impl: FakeApiRegisterInterface): ApiRegisterInterface
}