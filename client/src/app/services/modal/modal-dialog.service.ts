import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { CreateDrawingModalComponent } from 'src/app/components/pages/home/create-drawing-modal/create-drawing-modal.component';
import { UserGuideModalComponent } from 'src/app/components/pages/user-guide/user-guide/user-guide-modal.component';
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
        case ModalType.CREATE:
          return this.open(CreateDrawingModalComponent, {});
        case ModalType.GUIDE:
          return this.open(UserGuideModalComponent, {});
        case ModalType.CONFIRM:
          return this.open(ConfirmModalComponent, {});
      }
    }
    return null;
  }

  get modalIsOpened(): boolean {
    return this.openDialogs.length !== 0;
  }
}
