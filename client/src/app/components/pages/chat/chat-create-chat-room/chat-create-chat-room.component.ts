import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AbstractModalComponent } from '@components/shared/abstract-modal/abstract-modal.component';
import { ChatService } from '@services/chat.service';

@Component({
  selector: 'app-chat-create-chat-room',
  templateUrl: './chat-create-chat-room.component.html',
  styleUrls: ['./chat-create-chat-room.component.scss'],
})
export class ChatCreateChatRoomComponent extends AbstractModalComponent {
  roomName: string;

  constructor(private chatService: ChatService, dialogRef: MatDialogRef<AbstractModalComponent>) {
    super(dialogRef);

    this.roomName = '';
  }

  createChatRoom() {
    this.chatService.createChatRoom(this.roomName);
    this.dialogRef.close();
  }
}
