export enum SocketFriendActions {
    UPDATE = 'updateFriendList'                 // (friendList: FriendList)
}

export enum SocketFriendListNotifications {
    NOTIFICATION_RECEIVED = 'notification',     // (type: NotificationType, accountId: String)
    INVALIDATE_AVATAR = 'invalidateAvatar'      // (accountId: string, avatarId: string)
}

export enum NotificationType {
    userConnected = 'userConn',
    userDisconnected = 'userDisconn',
    userUploadedAvatar = 'uploadAvatar',
    userUpdatedAccount = 'updateAcc',
    requestReceived = 'request',
    requestAccepted = 'requestAccepted',
    requestRefused = 'requestRefused',
    unfriended = 'unfriended'
}
