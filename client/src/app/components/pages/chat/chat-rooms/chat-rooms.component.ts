import { Component, Input } from '@angular/core';
import { ChatService } from '@services/chat.service';
import { ModalDialogService } from '@services/modal/modal-dialog.service';
import { ModalType } from '@services/modal/modal-type.enum';

@Component({
  selector: 'app-chat-rooms',
  templateUrl: './chat-rooms.component.html',
  styleUrls: ['./chat-rooms.component.scss'],
})
export class ChatRoomsComponent {
  @Input() opened: boolean;

  constructor(private chatService: ChatService, private modalService: ModalDialogService) {}

  closeChatRooms() {
    this.chatService.toggleChatRooms();
  }

  openCreateChatRoom() {
    this.modalService.openByName(ModalType.CREATE_CHAT_ROOM);
  }

  get electronContainer(): Element | null {
    return document.querySelector('.container-after-titlebar');
  }

  get joinableRooms() {
    return this.chatService.chatState.joinableRooms;
  }

  get standalone() {
    return this.chatService.standalone;
  }
}
