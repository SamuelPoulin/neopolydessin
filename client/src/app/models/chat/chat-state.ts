import { FriendWithConnection } from '@common/communication/friends';
import { ChatRoom } from './chat-room';

export interface ChatState {
  rooms: ChatRoom[];
  joinableRooms: string[];
  friends: FriendWithConnection[];
  friendRequests: FriendWithConnection[];
  currentRoomIndex: number;
  guessing: boolean;
  friendslistOpened: boolean;
  chatRoomsOpened: boolean;
}
