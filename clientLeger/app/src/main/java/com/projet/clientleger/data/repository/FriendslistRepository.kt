package com.projet.clientleger.data.repository

import io.reactivex.rxjava3.core.Observable
import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.http.ApiFriendslistInterface
import com.projet.clientleger.data.api.model.FriendRequestDecisionModel
import com.projet.clientleger.data.api.model.FriendRequestModel
import com.projet.clientleger.data.api.socket.FriendslistSocketService
import com.projet.clientleger.data.enumData.FriendRequestDecision
import com.projet.clientleger.data.model.Friend
import com.projet.clientleger.data.model.Friendslist
import javax.inject.Inject
import javax.net.ssl.HttpsURLConnection
import kotlin.reflect.KSuspendFunction1
import retrofit2.Response

class FriendslistRepository @Inject constructor(private val friendslistSocketService: FriendslistSocketService, private val sessionManager: SessionManager, private val apiFriendslistInterface: ApiFriendslistInterface) {

    init {
    }
    suspend fun getFriends(): ArrayList<Friend>{
        val friendslist = ArrayList<Friend>()
        val res = sessionManager.request(apiFriendslistInterface::getFriends)
        if(res.code() == HttpsURLConnection.HTTP_OK)
            friendslist.addAll(res.body()!!.friends)
        return friendslist
    }

    private suspend fun <S> sendRequest(toSend: S, callback: KSuspendFunction1<S, Response<Friendslist>>): ArrayList<Friend>{
        val friendslist = ArrayList<Friend>()
        val res = sessionManager.request(toSend, callback)
        if(res.code() == HttpsURLConnection.HTTP_OK)
            friendslist.addAll(res.body()!!.friends)
        else
            println(res.code().toString() + res.message())
        return friendslist
    }

    suspend fun acceptFriend(idOfFriend: String): ArrayList<Friend>{
        println(idOfFriend)
        return sendRequest(FriendRequestDecisionModel(idOfFriend, FriendRequestDecision.ACCEPT.decision), apiFriendslistInterface::friendDecision)
    }

    suspend fun refuseFriend(idOfFriend: String): ArrayList<Friend>{
        return sendRequest(FriendRequestDecisionModel(idOfFriend, FriendRequestDecision.REFUSE.decision), apiFriendslistInterface::friendDecision)
    }


    suspend fun sendFriendRequest(friendUsername: String): ArrayList<Friend>{
        return sendRequest(FriendRequestModel(friendUsername), apiFriendslistInterface::sendFriendRequest)
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