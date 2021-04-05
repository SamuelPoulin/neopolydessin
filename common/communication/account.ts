import { Friend } from "./friends";


export interface AccountInfo {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    friends: Friend[];
    createdDate: number;
    avatar: string | undefined;
}

export interface PublicAccountInfo {
    accountId: string;
    username: string;
    avatar: string | undefined;
}