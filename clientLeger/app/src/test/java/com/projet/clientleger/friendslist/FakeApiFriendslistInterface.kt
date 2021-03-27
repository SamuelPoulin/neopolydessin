package com.projet.clientleger.friendslist

import com.projet.clientleger.data.api.ApiFriendslistInterface
import com.projet.clientleger.data.api.model.FriendRequestDecisionModel
import com.projet.clientleger.data.api.model.FriendRequestModel
import com.projet.clientleger.data.model.Friendslist
import retrofit2.Response
import javax.inject.Inject

class FakeApiFriendslistInterface @Inject constructor():ApiFriendslistInterface {
    override suspend fun getFriends(): Response<Friendslist> {
        TODO("Not yet implemented")
    }

    override suspend fun friendDecision(friendRequestDecisionModel: FriendRequestDecisionModel): Response<Friendslist> {
        TODO("Not yet implemented")
    }

    override suspend fun sendFriendRequest(request: FriendRequestModel): Response<Friendslist> {
        TODO("Not yet implemented")
    }
}