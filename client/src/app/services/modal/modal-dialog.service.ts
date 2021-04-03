import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PictureWordUploadComponent } from '@components/pages/picture-word/picture-word-upload/picture-word-upload.component';
import { AbstractModalComponent } from 'src/app/components/shared/abstract-modal/abstract-modal.component';
import { ConfirmModalComponent } from 'src/app/components/shared/abstract-modal/confirm-modal/confirm-modal/confirm-modal.component';
import { ModalType } from 'src/app/services/modal/modal-type.enum';

@Injectable({
  providedIn: 'root',
})
export class ModalDialogService extends MatDialog {
  openByName(dialogName: ModalType): MatDialogRef<AbstractModalComponent> | null {
    if (!this.modalIsOpened) {
      switch (dialogName) {
        case ModalType.CONFIRM:
          return this.open(ConfirmModalComponent, {});
        case ModalType.UPLOAD:
          return this.open(PictureWordUploadComponent, {});
      }
    }
    return null;
  }

  get modalIsOpened(): boolean {
    return this.openDialogs.length !== 0;
  }
}
