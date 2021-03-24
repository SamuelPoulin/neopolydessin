export interface Message {
  content: string;
}

export interface ChatMessage extends Message {
  senderUsername: string;
  timestamp: number;
}