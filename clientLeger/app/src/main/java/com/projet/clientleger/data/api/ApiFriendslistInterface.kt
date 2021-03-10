package com.projet.clientleger.data.api

import com.projet.clientleger.data.model.Friend
import com.projet.clientleger.data.model.Friendslist
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.HeaderMap
import retrofit2.http.POST

interface ApiFriendslistInterface {
    @GET("api/database/friends/")
    suspend fun getFriends(): Response<Friendslist>
}