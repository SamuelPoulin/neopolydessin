export enum FriendStatus {
    PENDING = 'pending',
    FRIEND = 'friend'
}

export interface FriendWithConnection extends Friend {
    isOnline: boolean;
}

export interface Friend {
    friendId: {
        _id: string;
        username: string;
        avatar: string;
    } | null;
    status: FriendStatus;
    received: boolean;
}

export interface FriendsList {
    friends: FriendWithConnection[];
}
