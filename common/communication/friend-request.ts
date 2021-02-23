export interface FriendRequest {
    email: string
}

export interface FriendResponse {
    idOfFriend: string
    decision: Decision
}

export enum Decision {
    ACCEPT = 'accept',
    REFUSE = 'refuse'
}