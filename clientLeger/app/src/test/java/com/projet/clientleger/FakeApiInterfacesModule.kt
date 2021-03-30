package com.projet.clientleger


import com.projet.clientleger.connexion.FakeApiConnectionInterface
import com.projet.clientleger.connexion.FakeApiSessionManagerInterface
import com.projet.clientleger.data.api.http.*
import com.projet.clientleger.di.ApiInterfacesModule
import com.projet.clientleger.friendslist.FakeApiFriendslistInterface
import com.projet.clientleger.register.FakeApiMainmenuInterface
import com.projet.clientleger.register.FakeApiRegisterInterface
import dagger.Binds
import dagger.Module
import dagger.hilt.components.SingletonComponent
import dagger.hilt.testing.TestInstallIn

@Module
@TestInstallIn(components = [SingletonComponent::class],
    replaces = [ApiInterfacesModule::class])
interface FakeApiInterfacesModule {
    @Binds fun bind(impl: FakeApiRegisterInterface): ApiRegisterInterface

    @Binds fun bindConnection(impl: FakeApiConnectionInterface): ApiConnectionInterface

    @Binds fun bindMainmenu(impl: FakeApiMainmenuInterface): ApiMainmenuInterface

    @Binds fun bindSessionManager(impl: FakeApiSessionManagerInterface) : ApiSessionManagerInterface

    @Binds fun bindFriendslist(impl: FakeApiFriendslistInterface) : ApiFriendslistInterface

    @Binds fun bindAvatar(impl: FakeApiAvatarInterface): ApiAvatarInterface
}