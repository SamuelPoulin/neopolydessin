package com.projet.clientleger.di

import com.projet.clientleger.data.api.ApiInterfaceBuilder
import com.projet.clientleger.data.api.ApiRegisterInterface
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@InstallIn(SingletonComponent::class)
@Module
object ApiInterfacesModule {

    @Provides
    @Singleton
    fun providesApiRegisterInterface(apiInterfaceBuilder: ApiInterfaceBuilder): ApiRegisterInterface = apiInterfaceBuilder.buildInterface(ApiRegisterInterface::class.java)
}