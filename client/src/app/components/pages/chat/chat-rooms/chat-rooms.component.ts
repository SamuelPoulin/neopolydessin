import { Component, Input } from '@angular/core';
import { ChatRoom } from '@models/chat/chat-room';
import { ChatService } from '@services/chat.service';
import { SocketService } from '@services/socket-service.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-rooms',
  templateUrl: './chat-rooms.component.html',
  styleUrls: ['./chat-rooms.component.scss'],
})
export class ChatRoomsComponent {
  @Input() opened: boolean;

  chatRoomsSubscription: Subscription;

  chatRooms: ChatRoom[];

  constructor(private chatService: ChatService, private socketService: SocketService) {
    this.chatRoomsSubscription = this.socketService.receiveChatRooms().subscribe((chatRooms) => {
      console.log(chatRooms);
    });
  }

  closeChatRooms() {
    this.chatService.chatRoomsOpened = false;
    this.chatService.friendslistOpened = false;
  }
}
