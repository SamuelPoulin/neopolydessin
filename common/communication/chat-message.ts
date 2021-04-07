export interface Message {
  content: string;
}

export interface SystemMessage extends Message {
  timestamp: number;
}

export interface ChatMessage extends SystemMessage {
  senderUsername: string;
}

export interface RoomChatMessage extends ChatMessage {
  roomName: string;
}

export interface RoomSystemMessage extends SystemMessage {
  roomName: string;
}