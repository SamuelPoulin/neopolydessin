import { Component, Input } from '@angular/core';
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

  get friends() {
    return this.chatService.friends;
  }

  get friendRequests() {
    return this.chatService.friendRequests;
  }
}
