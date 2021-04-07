import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AbstractModalComponent } from '@components/shared/abstract-modal/abstract-modal.component';
import { APIService } from '@services/api.service';

@Component({
  selector: 'app-chat-add-friend',
  templateUrl: './chat-add-friend.component.html',
  styleUrls: ['./chat-add-friend.component.scss'],
})
export class ChatAddFriendComponent extends AbstractModalComponent {
  username: string;

  constructor(dialogRef: MatDialogRef<AbstractModalComponent>, private apiService: APIService) {
    super(dialogRef);

    this.username = '';
  }

  addFriend() {
    this.apiService.addFriend(this.username);
    this.dialogRef.close();
  }
}
