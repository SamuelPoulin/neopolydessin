import { Component, Input } from '@angular/core';
import { ChatService } from '@services/chat.service';
import { ModalDialogService } from '@services/modal/modal-dialog.service';
import { ModalType } from '@services/modal/modal-type.enum';
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

  chatRooms: string[];

  constructor(private chatService: ChatService, private socketService: SocketService, private modalService: ModalDialogService) {
    this.chatRooms = [];

    this.chatRoomsSubscription = this.socketService.receiveChatRooms().subscribe((chatRooms) => {
      for (const chatRoom of chatRooms) {
        if (chatRoom !== 'general') {
          this.chatRooms.push(chatRoom);
        }
      }
    });
  }

  closeChatRooms() {
    this.chatService.chatRoomsOpened = false;
    this.chatService.friendslistOpened = false;
  }

  openCreateChatRoom() {
    this.modalService.openByName(ModalType.CREATE_CHAT_ROOM);
  }
}
