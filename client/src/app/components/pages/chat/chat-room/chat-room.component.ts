import { Component, Input } from '@angular/core';
import { ChatService } from '@services/chat.service';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss'],
})
export class ChatRoomComponent {
  @Input() room: string;

  constructor(private chatService: ChatService) {}

  join() {
    this.chatService.joinChatRoom(this.room);
  }

  delete() {
    this.chatService.deleteChatRoom(this.room);
  }
}
