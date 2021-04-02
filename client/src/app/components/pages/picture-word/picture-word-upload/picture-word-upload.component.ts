import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AbstractModalComponent } from '@components/shared/abstract-modal/abstract-modal.component';

@Component({
  selector: 'app-picture-word-upload',
  templateUrl: './picture-word-upload.component.html',
  styleUrls: ['./picture-word-upload.component.scss'],
})
export class PictureWordUploadComponent extends AbstractModalComponent {
  word: string = '';
  imageString: string = '';

  constructor(dialogRef: MatDialogRef<AbstractModalComponent>) {
    super(dialogRef);
  }

  upload(): void {
    //
  }

  acceptFile(file: File): void {
    //
  }
}
