export interface Message {
  content: string;
  timestamp: number;
}

export interface ChatMessage extends Message {
  senderAccountId: string;
}