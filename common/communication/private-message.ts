import {Message} from './chat-message'

export interface PrivateMessage extends Message {
    receiverAccountId: string;
}