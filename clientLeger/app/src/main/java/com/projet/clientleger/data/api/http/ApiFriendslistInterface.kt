package com.projet.clientleger.data.api.http

import com.projet.clientleger.data.api.model.FriendRequestDecisionModel
import com.projet.clientleger.data.api.model.FriendRequestModel
import com.projet.clientleger.data.model.Friendslist
import retrofit2.Response
import retrofit2.http.*

interface ApiFriendslistInterface {
    @GET("api/database/friends/")
    suspend fun getFriends(): Response<Friendslist>

    @POST("api/database/friends/decision/")
    suspend fun friendDecision(@Body friendRequestDecisionModel: FriendRequestDecisionModel): Response<Friendslist>

    @POST("api/database/friends/")
    suspend fun sendFriendRequest(@Body request: FriendRequestModel): Response<Friendslist>
}