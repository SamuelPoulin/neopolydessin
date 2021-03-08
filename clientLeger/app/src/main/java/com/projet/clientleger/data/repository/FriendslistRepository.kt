package com.projet.clientleger.data.repository

import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.ApiFriendslistInterface
import com.projet.clientleger.data.api.model.FriendRequestDecisionModel
import com.projet.clientleger.data.enum.FriendRequestDecision
import com.projet.clientleger.data.model.Friend
import com.projet.clientleger.data.model.Friendslist
import javax.inject.Inject

class FriendslistRepository @Inject constructor(private val sessionManager: SessionManager, private val apiFriendslistInterface: ApiFriendslistInterface) {
    suspend fun getFriends():Friendslist{
        val res = sessionManager.request(apiFriendslistInterface::getFriends)
        return res.body()!!
    }

    suspend fun acceptFriend(idOfFriend: String): Friendslist{
        return sessionManager.request(FriendRequestDecisionModel(idOfFriend, FriendRequestDecision.ACCEPT.decision),apiFriendslistInterface::friendDecision).body()!!
    }

    suspend fun refuseFriend(idOfFriend: String): Friendslist{
        return sessionManager.request(FriendRequestDecisionModel(idOfFriend, FriendRequestDecision.REFUSE.decision),apiFriendslistInterface::friendDecision).body()!!
    }
}