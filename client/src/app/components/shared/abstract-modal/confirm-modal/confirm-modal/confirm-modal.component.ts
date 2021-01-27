import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { AbstractModalComponent } from 'src/app/components/shared/abstract-modal/abstract-modal.component';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss'],
})
export class ConfirmModalComponent extends AbstractModalComponent {
  constructor(dialogRef: MatDialogRef<AbstractModalComponent>) {
    super(dialogRef);
  }
  onConfirmClick(): void {
    this.dialogRef.close(true);
  }
}
