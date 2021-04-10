import { Component, Input } from '@angular/core';
import { FriendWithConnection } from '@common/communication/friends';
import { ChatService } from '@services/chat.service';
import { ModalDialogService } from '@services/modal/modal-dialog.service';
import { ModalType } from '@services/modal/modal-type.enum';

@Component({
  selector: 'app-chat-friendslist',
  templateUrl: './chat-friendslist.component.html',
  styleUrls: ['./chat-friendslist.component.scss'],
})
export class ChatFriendslistComponent {
  @Input() opened: boolean;

  constructor(public chatService: ChatService, private modalService: ModalDialogService) {}

  closeFriendslist() {
    this.chatService.friendslistOpened = false;
  }

  openAddFriend() {
    this.modalService.openByName(ModalType.ADD_FRIEND);
  }

  get friends(): FriendWithConnection[] {
    return this.chatService.friends;
  }

  get friendRequests(): FriendWithConnection[] {
    return this.chatService.friendRequests;
  }

  get electronContainer(): Element | null {
    return document.querySelector('.container-after-titlebar');
  }
}
