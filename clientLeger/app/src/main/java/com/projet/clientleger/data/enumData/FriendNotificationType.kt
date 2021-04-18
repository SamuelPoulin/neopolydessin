package com.projet.clientleger.data.enumData

enum class FriendNotificationType(val value: String, val actionNeeded: FriendsAction){
    USER_CONNECTED("userConn", FriendsAction.GET_UPDATE),
    USER_DISCONNECTED("userDisconn", FriendsAction.GET_UPDATE),
    USER_UPLOADED_AVATAR("uploadAvatar", FriendsAction.NONE),
    USER_UPDATED_ACCOUNT("updateAcc", FriendsAction.GET_UPDATE),
    REQUEST_RECEIVED("request", FriendsAction.SHOW_NOTIFICATION),
    REQUEST_ACCEPTED("requestAccepted", FriendsAction.SHOW_NOTIFICATION),
    REQUEST_REFUSED("requestRefused", FriendsAction.SHOW_NOTIFICATION),
    UNFRIEND("unfriended", FriendsAction.SHOW_NOTIFICATION);

    companion object{
        fun stringToEnum(toEnum: String): FriendNotificationType {
            return when (toEnum) {
                USER_CONNECTED.value -> USER_CONNECTED
                USER_DISCONNECTED.value -> USER_DISCONNECTED
                USER_UPLOADED_AVATAR.value -> USER_UPLOADED_AVATAR
                USER_UPDATED_ACCOUNT.value -> USER_UPDATED_ACCOUNT
                REQUEST_RECEIVED.value -> REQUEST_RECEIVED
                REQUEST_ACCEPTED.value -> REQUEST_ACCEPTED
                REQUEST_REFUSED.value -> REQUEST_REFUSED
                else -> UNFRIEND
            }
        }
    }
}
