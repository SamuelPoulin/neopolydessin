import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AbstractModalComponent } from '@components/shared/abstract-modal/abstract-modal.component';
import { SocketService } from '@services/socket-service.service';

@Component({
  selector: 'app-chat-create-chat-room',
  templateUrl: './chat-create-chat-room.component.html',
  styleUrls: ['./chat-create-chat-room.component.scss'],
})
export class ChatCreateChatRoomComponent extends AbstractModalComponent {
  roomName: string;

  constructor(dialogRef: MatDialogRef<AbstractModalComponent>, private socketService: SocketService) {
    super(dialogRef);

    this.roomName = '';
  }

  createChatRoom() {
    this.socketService.createChatRoom(this.roomName);
    this.dialogRef.close();
  }
}
