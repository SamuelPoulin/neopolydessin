package com.projet.clientleger.di

import com.projet.clientleger.data.api.*
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

    @Provides
    @Singleton
    fun providesApiConnectionInterface(apiInterfaceBuilder: ApiInterfaceBuilder): ApiConnectionInterface = apiInterfaceBuilder.buildInterface(ApiConnectionInterface::class.java)

    @Provides
    @Singleton
    fun providesApiMainmenuInterface(apiInterfaceBuilder: ApiInterfaceBuilder): ApiMainmenuInterface = apiInterfaceBuilder.buildInterface(ApiMainmenuInterface::class.java)

    @Provides
    @Singleton
    fun providesApiFriendslistInterface(apiInterfaceBuilder: ApiInterfaceBuilder): ApiFriendslistInterface = apiInterfaceBuilder.buildInterface(ApiFriendslistInterface::class.java)


    @Provides
    @Singleton
    fun providesApiSessionManagernterface(apiInterfaceBuilder: ApiInterfaceBuilder): ApiSessionManagerInterface = apiInterfaceBuilder.buildInterface(ApiSessionManagerInterface::class.java)

}