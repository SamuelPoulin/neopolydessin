package com.projet.clientleger.data.api.http

import com.projet.clientleger.data.api.model.FriendRequestDecisionModel
import com.projet.clientleger.data.api.model.FriendRequestModel
import com.projet.clientleger.data.api.model.chat.MessageHistory
import com.projet.clientleger.data.model.friendslist.Friendslist
import retrofit2.Response
import retrofit2.http.*

interface ApiFriendslistInterface {
    @GET("api/database/friends/")
    suspend fun getFriends(): Response<Friendslist>

    @POST("api/database/friends/decision/")
    suspend fun friendDecision(@Body friendRequestDecisionModel: FriendRequestDecisionModel): Response<Friendslist>

    @POST("api/database/friends/")
    suspend fun sendFriendRequest(@Body request: FriendRequestModel): Response<Friendslist>

    @GET("api/database/friends/history/")
    suspend fun getFriendChatHistory(@Query("page") pageNumber: Int,
                                     @Query("otherId") friendId: String,
                                     @Query("limit") messagePerPage: Int): Response<MessageHistory>
}