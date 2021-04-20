package com.projet.clientleger.data.api.socket

import com.projet.clientleger.data.endpoint.FriendslistSocketEndpoint
import com.projet.clientleger.data.enumData.FriendNotificationType
import com.projet.clientleger.data.model.friendslist.Friend
import com.projet.clientleger.data.model.friendslist.FriendId
import com.projet.clientleger.data.model.friendslist.FriendNotification
import io.reactivex.rxjava3.core.Observable
import kotlinx.serialization.json.Json
import org.json.JSONArray
import org.json.JSONObject
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class FriendslistSocketService @Inject constructor(val socketService: SocketService){

    fun updateFriendslist(): Observable<ArrayList<Friend>>{
        return socketService.receiveFromSocket(FriendslistSocketEndpoint.UPDATE.value) { (friends) ->
            val friendsJson = (friends as JSONObject)["friends"] as JSONArray
            val friendslist = ArrayList<Friend>()
            for(i in 0 until friendsJson.length())
                friendslist.add( Json.decodeFromString(Friend.serializer(), friendsJson[i].toString()))
            friendslist
        }
    }

    fun receiveNotification(): Observable<FriendNotification> {
        return socketService.receiveFromSocket(FriendslistSocketEndpoint.RECEIVE_NOTIFICATION.value){ (type, friendId) ->
            FriendNotification(FriendNotificationType.stringToEnum(type as String), friendId as String)
        }
    }

    fun receiveAvatarNotification(): Observable<Pair<String, String>> {
        return socketService.receiveFromSocket(FriendslistSocketEndpoint.RECEIVE_AVATAR_NOTIFICATION.value){ (friendId, avatarId) ->
            Pair(friendId as String, avatarId as String)
        }
    }

    fun inviteFriend(friendId: String){
        socketService.socket.emit(FriendslistSocketEndpoint.INVITE_FRIEND.value, friendId)
    }

    fun receiveInvite(): Observable<Pair<String, String>>{
        return socketService.receiveFromSocket(FriendslistSocketEndpoint.RECEIVE_INVITE.value){ (username, lobbyId) ->
                Pair(username as String, lobbyId as String)
        }
    }
}