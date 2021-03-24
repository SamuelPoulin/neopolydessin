export interface Message {
  content: string;
  timestamp: number;
}

export interface ChatMessage extends Message {
  senderUsername: string;
}