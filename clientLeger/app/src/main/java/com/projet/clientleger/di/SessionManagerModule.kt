package com.projet.clientleger.di

import android.content.Context
import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.TokenInterceptor
import com.projet.clientleger.data.api.http.ApiSessionManagerInterface
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
    fun provideSessionManager(@ApplicationContext context: Context, tokenInterceptor: TokenInterceptor, apiSessionManagerInterface: ApiSessionManagerInterface): SessionManager = SessionManager(context, tokenInterceptor, apiSessionManagerInterface)
}