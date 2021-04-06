import { Component, Input, OnInit } from '@angular/core';
import { FriendStatus, FriendWithConnection } from '@common/communication/friends';

@Component({
  selector: 'app-chat-friend',
  templateUrl: './chat-friend.component.html',
  styleUrls: ['./chat-friend.component.scss'],
})
export class ChatFriendComponent implements OnInit {
  @Input() friend: FriendWithConnection;

  ngOnInit() {
    console.log(this.friend);
  }

  get username() {
    return this.friend.friendId?.username;
  }

  get avatarId() {
    return this.friend.friendId?.avatar;
  }

  get friendStatus() {
    return FriendStatus;
  }
}
