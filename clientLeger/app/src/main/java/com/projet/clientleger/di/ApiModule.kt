package com.projet.clientleger.di

import android.content.Context
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import com.projet.clientleger.BuildConfig
import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.TokenInterceptor
import com.projet.clientleger.data.api.http.ApiSessionManagerInterface
import com.projet.clientleger.data.api.socket.LobbySocketService
import com.projet.clientleger.data.api.socket.DrawingSocketService
import com.projet.clientleger.data.api.socket.FriendslistSocketService
import com.projet.clientleger.data.api.socket.SocketService
import com.projet.clientleger.data.service.DrawingCommandsService
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.converter.scalars.ScalarsConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object ApiModule {

    @Provides
    @Singleton
    fun provideGson(): Gson = GsonBuilder()
        .setLenient()
        .create()

    @Provides
    @Singleton
    fun provideOkHttp(tokenInterceptor: TokenInterceptor): OkHttpClient =
        OkHttpClient.Builder()
            .addInterceptor(tokenInterceptor)
            .readTimeout(100, TimeUnit.SECONDS)
            .connectTimeout(100, TimeUnit.SECONDS)
            .build()

    @Provides
    @Singleton
    fun provideRetrofitClient(
        okHttp: OkHttpClient,
        gson: Gson
    ): Retrofit = Retrofit.Builder()
            .baseUrl(BuildConfig.SERVER_URL)
            //.baseUrl("http://10.0.2.2:3205")
            .client(okHttp)
        .addConverterFactory(GsonConverterFactory.create(gson))
            .addConverterFactory(ScalarsConverterFactory.create())
        .build()

    @Provides
    @Singleton
    fun provideTokenInterceptor(): TokenInterceptor = TokenInterceptor()

    @Provides
    @Singleton
    fun provideDrawingCommandService(): DrawingCommandsService = DrawingCommandsService()

    @Provides
    @Singleton
    fun provideSocketService(): SocketService = SocketService()

    @Provides
    @Singleton
    fun provideDrawingSocketService(socketService: SocketService): DrawingSocketService = DrawingSocketService(socketService)

    @Provides
    @Singleton
    fun provideFriendslistSocketService(socketService: SocketService): FriendslistSocketService = FriendslistSocketService(socketService)

    @Provides
    @Singleton
    fun provideSessionManager(@ApplicationContext context: Context, tokenInterceptor: TokenInterceptor, apiSessionManagerInterface: ApiSessionManagerInterface):SessionManager = SessionManager(context, tokenInterceptor, apiSessionManagerInterface)

    @Provides
    @Singleton
    fun provideLobbySocketService(socketService:SocketService): LobbySocketService = LobbySocketService(socketService)
}
