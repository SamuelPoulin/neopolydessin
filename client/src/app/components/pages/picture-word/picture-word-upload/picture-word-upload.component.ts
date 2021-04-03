import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AbstractModalComponent } from '@components/shared/abstract-modal/abstract-modal.component';
import { APIService } from '@services/api.service';
import { PictureWordPicture } from '@common/communication/picture-word';
import { Difficulty } from '@common/communication/lobby';
import { DrawMode } from '@common/communication/draw-mode';
import { Color } from '@utils/color/color';

@Component({
  selector: 'app-picture-word-upload',
  templateUrl: './picture-word-upload.component.html',
  styleUrls: ['./picture-word-upload.component.scss'],
})
export class PictureWordUploadComponent extends AbstractModalComponent {
  word: string = '';
  hints: string[] = [];
  difficulty: Difficulty;
  drawMode: DrawMode;
  color: Color;
  imageString: string = '';
  imageData: ArrayBuffer = new ArrayBuffer(0);

  constructor(dialogRef: MatDialogRef<AbstractModalComponent>, private api: APIService) {
    super(dialogRef);
  }

  upload(): void {
    this.hints = ['1', '2', '3'];
    this.color = Color.BLACK;
    this.difficulty = Difficulty.EASY;
    this.drawMode = DrawMode.CONVENTIONAL;

    const data: PictureWordPicture = {
      word: this.word,
      hints: this.hints,
      difficulty: this.difficulty,
      drawMode: this.drawMode,
      color: this.color.hexString,
      picture: this.imageString,
    };
    this.api.uploadPicture(data).then((id: number) => {
      console.log(id);
    });
  }

  acceptFile(fileList: FileList): void {
    const dataReader = new FileReader();
    const stringReader = new FileReader();

    dataReader.onload = (e: ProgressEvent) => {
      if (dataReader.result) {
        this.imageData = dataReader.result as ArrayBuffer;
      }
    };

    stringReader.onload = (e: ProgressEvent) => {
      if (stringReader.result) {
        this.imageString = stringReader.result.toString();
      }
    };

    if (fileList[0]) {
      dataReader.readAsArrayBuffer(fileList[0]);
      stringReader.readAsDataURL(fileList[0]);
    }
  }
}
