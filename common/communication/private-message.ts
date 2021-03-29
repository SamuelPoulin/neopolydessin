import { Message, SystemMessage } from './chat-message'

export interface PrivateMessage extends Message {
    receiverAccountId: string;
}

export interface ReceivedPrivateMessage extends SystemMessage {
    senderAccountId: string;
}