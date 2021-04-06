import { Component, Input } from '@angular/core';
import { FriendWithConnection } from '@common/communication/friends';
import { ChatService } from '@services/chat.service';

@Component({
  selector: 'app-chat-friendslist',
  templateUrl: './chat-friendslist.component.html',
  styleUrls: ['./chat-friendslist.component.scss'],
})
export class ChatFriendslistComponent {
  @Input() opened: boolean;

  constructor(private chatService: ChatService) {}

  closeFriendslist() {
    this.chatService.friendslistOpened = false;
  }

  get friends(): FriendWithConnection[] {
    return this.chatService.friends;
  }

  get friendRequests(): FriendWithConnection[] {
    return this.chatService.friendRequests;
  }
}
