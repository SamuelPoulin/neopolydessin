package com.projet.clientleger.data.endpoint

enum class FriendslistSocketEndpoint(val value: String) {
    UPDATE("updateFriendList"),
    RECEIVE_NOTIFICATION("notification"),
    RECEIVE_AVATAR_NOTIFICATION("invalidateAvatar"),
    INVITE_FRIEND("sendInviteToFriend"),
    RECEIVE_INVITE("receiveInviteFromFriend")
}