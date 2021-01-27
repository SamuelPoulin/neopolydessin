import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-abstract-modal',
  templateUrl: './abstract-modal.component.html',
  styleUrls: ['./abstract-modal.component.scss'],
})
export class AbstractModalComponent {
  constructor(public dialogRef: MatDialogRef<AbstractModalComponent>) {}

  onCloseClick(): void {
    this.dialogRef.close();
  }
}
