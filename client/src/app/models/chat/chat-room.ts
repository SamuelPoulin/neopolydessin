import { Message } from '../../../../../common/communication/chat-message';

export interface ChatRoom {
  name: string;
  id: string;
  type: ChatRoomType;
  messages: Message[];
  newMessage: boolean;
}

export interface PrivateChatRoom {
  peerId: string;
}

export enum ChatRoomType {
  GENERAL = 0,
  GAME = 1,
  PRIVATE = 2,
  GROUP = 3,
}
