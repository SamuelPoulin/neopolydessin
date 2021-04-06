import { Component, Input } from '@angular/core';
import { FriendStatus, FriendWithConnection } from '@common/communication/friends';

@Component({
  selector: 'app-chat-friend',
  templateUrl: './chat-friend.component.html',
  styleUrls: ['./chat-friend.component.scss'],
})
export class ChatFriendComponent {
  @Input() friend: FriendWithConnection;

  get username() {
    return this.friend.friendId?.username;
  }

  get avatarId() {
    return this.friend.friendId?.avatar;
  }

  get friendStatus() {
    return FriendStatus;
  }

  confirm() {
    console.log('Friend confirmed!');
  }

  reject() {
    console.log('Friend rejected!');
  }

  invite() {
    console.log('Friend invited!');
  }

  unfriend() {
    console.log('Friend unfriended!');
  }

  chat() {
    console.log('Started chat with friend!');
  }
}
