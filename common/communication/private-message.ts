import { Message, SystemMessage } from './chat-message'

export interface PrivateMessageTo extends Message {
    receiverAccountId: string;
}

export interface PrivateMessage extends SystemMessage {
    senderAccountId: string;
    receiverAccountId: string;
}