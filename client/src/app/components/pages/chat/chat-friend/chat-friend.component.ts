import { Component, Input } from '@angular/core';
import { Decision } from '@common/communication/friend-request';
import { FriendStatus, FriendWithConnection } from '@common/communication/friends';
import { APIService } from '@services/api.service';
import { ChatService } from '@services/chat.service';

@Component({
  selector: 'app-chat-friend',
  templateUrl: './chat-friend.component.html',
  styleUrls: ['./chat-friend.component.scss'],
})
export class ChatFriendComponent {
  @Input() friend: FriendWithConnection;

  constructor(private apiService: APIService, private chatService: ChatService) {
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
      this.apiService.sendFriendDecision(this.friend.friendId?._id, Decision.ACCEPT);
    }
  }

  reject() {
    if (this.friend.friendId?._id) {
      this.apiService.sendFriendDecision(this.friend.friendId?._id, Decision.REFUSE);
    }
  }

  invite() {
    console.log('Friend invited!');
  }

  unfriend() {
    console.log('Friend unfriended!');
    if (this.friend.friendId?._id) {
      this.apiService.removeFriend(this.friend.friendId._id);
    }
  }

  chat() {
    console.log('Started chat with friend!');
    if (this.friend.friendId?._id && this.friend.friendId.username) {
      this.chatService.createDM(this.friend.friendId.username, this.friend.friendId._id);
    }
  }
}
