import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AbstractModalComponent } from '@components/shared/abstract-modal/abstract-modal.component';
import { ChatService } from '@services/chat.service';

@Component({
  selector: 'app-chat-add-friend',
  templateUrl: './chat-add-friend.component.html',
  styleUrls: ['./chat-add-friend.component.scss'],
})
export class ChatAddFriendComponent extends AbstractModalComponent {
  username: string;

  constructor(dialogRef: MatDialogRef<AbstractModalComponent>, private chatService: ChatService) {
    super(dialogRef);

    this.username = '';
  }

  addFriend() {
    this.chatService.addFriend(this.username);
    this.dialogRef.close();
  }
}
