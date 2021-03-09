package com.projet.clientleger.data.enum

enum class FriendslistSocketEndpoint(val endpoint: String) {
    FRIEND_REQUEST_RECEIVED("friendRequestReceived"),
    FRIEND_REQUEST_ACCEPTED("friendRequestAccept"),
    FRIEND_REQUEST_REFUSED("friendRequestRefused"),
    UPDATE("updateFriendList")
}