package com.projet.clientleger.data.repository

import io.reactivex.rxjava3.core.Observable
import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.ApiFriendslistInterface
import com.projet.clientleger.data.api.model.FriendRequestDecisionModel
import com.projet.clientleger.data.api.model.FriendRequestModel
import com.projet.clientleger.data.api.service.FriendslistSocketService
import com.projet.clientleger.data.enum.FriendRequestDecision
import com.projet.clientleger.data.model.Friend
import com.projet.clientleger.data.model.Friendslist
import javax.inject.Inject

class FriendslistRepository @Inject constructor(private val friendslistSocketService: FriendslistSocketService, private val sessionManager: SessionManager, private val apiFriendslistInterface: ApiFriendslistInterface) {

    init {
    }
    suspend fun getFriends():Friendslist{
        val res = sessionManager.request(apiFriendslistInterface::getFriends)
        return res.body()!!
    }

    suspend fun acceptFriend(idOfFriend: String): Friendslist{
        val friends = sessionManager.request(FriendRequestDecisionModel(idOfFriend, FriendRequestDecision.ACCEPT.decision),apiFriendslistInterface::friendDecision).body()!!
        return friends
    }

    suspend fun refuseFriend(idOfFriend: String): Friendslist{
        return sessionManager.request(FriendRequestDecisionModel(idOfFriend, FriendRequestDecision.REFUSE.decision),apiFriendslistInterface::friendDecision).body()!!
    }

    suspend fun sendFriendRequest(friendUsername: String): Friendslist{
        return sessionManager.request(FriendRequestModel(friendUsername), apiFriendslistInterface::sendFriendRequest).body()!!
    }

    fun friendRequestReceived(): Observable<Friendslist>{
        return friendslistSocketService.friendRequestReceived()
    }

    fun updateFriendslist(): Observable<Friendslist>{
        return friendslistSocketService.updateFriendslist()
    }

    fun friendRequestAccepted(): Observable<Friendslist>{
        return friendslistSocketService.friendRequestAccepted()
    }

    fun friendRequestRefused(): Observable<Friendslist>{
        return friendslistSocketService.friendRequestRefused()
    }

}