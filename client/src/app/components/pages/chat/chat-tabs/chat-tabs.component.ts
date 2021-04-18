import { Component } from '@angular/core';
import { ChatService } from '@services/chat.service';

@Component({
  selector: 'app-chat-tabs',
  templateUrl: './chat-tabs.component.html',
  styleUrls: ['./chat-tabs.component.scss'],
})
export class ChatTabsComponent {
  constructor(private chatService: ChatService) {}

  get rooms() {
    return this.chatService.chatState.rooms;
  }
}
