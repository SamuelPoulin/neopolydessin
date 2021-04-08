import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { ChatAddFriendComponent } from '@components/pages/chat/chat-add-friend/chat-add-friend.component';
import { HomeGamemodeComponent } from '@components/pages/home/home-gamemode/home-gamemode.component';
import { PictureWordUploadComponent } from '@components/pages/picture-word/picture-word-upload/picture-word-upload.component';
import { AbstractModalComponent } from 'src/app/components/shared/abstract-modal/abstract-modal.component';
import { ConfirmModalComponent } from 'src/app/components/shared/abstract-modal/confirm-modal/confirm-modal/confirm-modal.component';
import { ModalType } from 'src/app/services/modal/modal-type.enum';

@Injectable({
  providedIn: 'root',
})
export class ModalDialogService extends MatDialog {
  openByName(dialogName: ModalType, options: MatDialogConfig = {}): MatDialogRef<AbstractModalComponent> | null {
    if (!this.modalIsOpened) {
      switch (dialogName) {
        case ModalType.CONFIRM:
          return this.open(ConfirmModalComponent, options);
        case ModalType.UPLOAD:
          return this.open(PictureWordUploadComponent, options);
        case ModalType.ADD_FRIEND:
          return this.open(ChatAddFriendComponent, options);
        case ModalType.CHOOSE_GAMEMODE:
          return this.open(HomeGamemodeComponent, options);
      }
    }
    return null;
  }

  get modalIsOpened(): boolean {
    return this.openDialogs.length !== 0;
  }
}
