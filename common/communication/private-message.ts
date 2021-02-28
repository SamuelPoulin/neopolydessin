import {ChatMessage} from './chat-message'

export interface PrivateMessage extends ChatMessage {
    receiverAccountId: string;
}