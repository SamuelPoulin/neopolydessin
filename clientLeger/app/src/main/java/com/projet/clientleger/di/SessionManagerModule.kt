package com.projet.clientleger.di

import android.content.Context
import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.TokenInterceptor
import com.projet.clientleger.data.api.http.ApiAvatarInterface
import com.projet.clientleger.data.api.http.ApiSessionManagerInterface
import com.projet.clientleger.data.api.socket.SocketService
import com.projet.clientleger.data.service.AvatarStorageService
import com.projet.clientleger.data.service.ChatStorageService
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object SessionManagerModule {
    @Provides
    @Singleton
    fun provideSessionManager(@ApplicationContext context: Context,
                              tokenInterceptor: TokenInterceptor,
                              apiSessionManagerInterface: ApiSessionManagerInterface,
                              apiAvatarInterface: ApiAvatarInterface,
                              socketService: SocketService,
                              chatStorageService: ChatStorageService): SessionManager = SessionManager(context, tokenInterceptor, apiSessionManagerInterface,
            apiAvatarInterface, socketService, chatStorageService)
}