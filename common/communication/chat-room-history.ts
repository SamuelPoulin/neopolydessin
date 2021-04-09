import { ChatMessage, SystemMessage } from "./chat-message";

export interface ChatRoomHistory {
    roomName: string;
    messages: ChatRoomMessage[];
}

export interface ChatRoomMessage extends ChatMessage {
    senderAccountId: string;
    roomName: string;
}

export interface ChatRoomSystemMessage extends SystemMessage {
    roomName: string;
}