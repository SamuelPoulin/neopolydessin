import { FriendStatus } from "./friends";

export interface AccountFriend {
    friendId: string,
    status: FriendStatus,
    received: boolean
}

export interface AccountInfo {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    friends: AccountFriend[];
    createdDate: number;
    avatar: string;
}

export interface PublicAccountInfo {
    accountId: string;
    username: string;
    avatar: string;
}