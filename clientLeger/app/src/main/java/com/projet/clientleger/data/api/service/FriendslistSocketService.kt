package com.projet.clientleger.data.api.service

import com.projet.clientleger.data.enum.FriendslistSocketEndpoint
import com.projet.clientleger.data.model.Friendslist
import io.reactivex.rxjava3.core.Observable
import kotlinx.serialization.json.Json
import org.json.JSONObject
import retrofit2.Response
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class FriendslistSocketService @Inject constructor(val socketService: SocketService){

    fun updateFriendslist(): Observable<Friendslist>{
        return socketService.receiveFromSocket(FriendslistSocketEndpoint.UPDATE.endpoint) { res ->
            Json.decodeFromString(Friendslist.serializer(), (res[0] as JSONObject)["documents"].toString())
        }
    }

    fun friendRequestReceived(): Observable<Friendslist>{
        return socketService.receiveFromSocket(FriendslistSocketEndpoint.FRIEND_REQUEST_RECEIVED.endpoint) { res ->
            Json.decodeFromString(Friendslist.serializer(), (res[0] as JSONObject)["documents"].toString())
        }
    }

    fun friendRequestAccepted(): Observable<Friendslist>{
        return socketService.receiveFromSocket(FriendslistSocketEndpoint.FRIEND_REQUEST_ACCEPTED.endpoint) { res ->
            Json.decodeFromString(Friendslist.serializer(), (res[0] as JSONObject)["documents"].toString())
        }
    }

    fun friendRequestRefused(): Observable<Friendslist>{
        return socketService.receiveFromSocket(FriendslistSocketEndpoint.FRIEND_REQUEST_REFUSED.endpoint) { res ->
            Json.decodeFromString(Friendslist.serializer(), (res[0] as JSONObject)["documents"].toString())
        }
    }
}