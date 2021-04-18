export interface Message {
  content: string;
}

export interface SystemMessage extends Message {
  timestamp: number;
}

export interface ChatMessage extends SystemMessage {
  senderUsername: string;
}
