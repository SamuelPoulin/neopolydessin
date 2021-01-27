import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { AbstractModalComponent } from 'src/app/components/shared/abstract-modal/abstract-modal.component';
import { ModalType } from 'src/app/services/modal/modal-type.enum';

@Component({
  selector: 'app-choose-export-save-modal',
  templateUrl: './choose-export-save-modal.component.html',
  styleUrls: ['./choose-export-save-modal.component.scss'],
})
export class ChooseExportSaveModalComponent extends AbstractModalComponent {
  @Output() saveButtonClicked: EventEmitter<boolean>;
  @Output() exportButtonClicked: EventEmitter<boolean>;

  constructor(public dialogRef: MatDialogRef<AbstractModalComponent>) {
    super(dialogRef);
    this.saveButtonClicked = new EventEmitter<boolean>();
    this.exportButtonClicked = new EventEmitter<boolean>();
  }

  openSave(): void {
    this.dialogRef.close(ModalType.SAVE);
  }

  openExport(): void {
    this.dialogRef.close(ModalType.EXPORT);
  }
}
