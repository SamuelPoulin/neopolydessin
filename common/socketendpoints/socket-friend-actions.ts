export enum SocketFriendActions {
    FRIEND_REQUEST_RECEIVED = 'friendRequestReceived',
    FRIEND_REQUEST_ACCEPTED = 'friendRequestAccept',
    FRIEND_REQUEST_REFUSED = 'friendRequestRefused',
    UPDATE = 'updateFriendList'
}

export enum SocketFriendListNotifications {
    UPDATE = 'fetchFriendList',
    INVALIDATE_AVATAR = 'invalidateAvatar'
}