export interface Message {
  content: string;
  timestamp: number;
}

export interface ChatMessage extends Message {
  user: string;
}