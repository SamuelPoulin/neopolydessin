import { Component, Input } from '@angular/core';
import { FriendStatus, FriendWithConnection } from '@common/communication/friends';
import { ChatService } from '@services/chat.service';

@Component({
  selector: 'app-chat-friend',
  templateUrl: './chat-friend.component.html',
  styleUrls: ['./chat-friend.component.scss'],
})
export class ChatFriendComponent {
  @Input() friend: FriendWithConnection;

  constructor(private chatService: ChatService) {
    this.friend = { friendId: { _id: '', avatar: '', username: '' }, isOnline: false, status: FriendStatus.PENDING, received: false };
  }

  get username() {
    return this.friend.friendId?.username;
  }

  get avatarId() {
    return this.friend.friendId?.avatar;
  }

  get canConfirm(): boolean {
    return this.friend.received;
  }

  get friendStatus() {
    return FriendStatus;
  }

  confirm() {
    if (this.friend.friendId?._id) {
      this.chatService.confirmFriend(this.friend.friendId?._id);
    }
  }

  reject() {
    if (this.friend.friendId?._id) {
      this.chatService.rejectFriend(this.friend.friendId?._id);
    }
  }

  invite() {
    if (this.friend.friendId?._id) {
      this.chatService.inviteFriend(this.friend.friendId._id);
    }
  }

  unfriend() {
    if (this.friend.friendId?._id) {
      this.chatService.removeFriend(this.friend.friendId._id);
    }
  }

  chat() {
    if (this.friend.friendId?._id && this.friend.friendId.username) {
      this.chatService.createDM(this.friend.friendId.username, this.friend.friendId._id);
    }
  }

  get canInvite() {
    return this.friend.isOnline && this.chatService.chatState.inGame;
  }
}
