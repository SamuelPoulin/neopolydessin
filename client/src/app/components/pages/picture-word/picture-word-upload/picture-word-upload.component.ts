import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AbstractModalComponent } from '@components/shared/abstract-modal/abstract-modal.component';
import { APIService } from '@services/api.service';
import { PictureWordPicture } from '@common/communication/picture-word';
import { Difficulty } from '@common/communication/lobby';
import { DrawMode } from '@common/communication/draw-mode';
import { Color } from '@utils/color/color';
import { DrawingSequence } from '@common/communication/drawing-sequence';
import { Coordinate } from '@utils/math/coordinate';
import { VIEWPORT_DIMENSION } from '@common/communication/viewport';

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
  imageData: string = '';
  readonly size: number = 600;

  @ViewChild('preview') preview: ElementRef;

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
      picture: this.imageData,
    };

    this.api.uploadPicture(data).then((id: string) => {
      this.showPreview(id);
    });
  }

  acceptFile(fileList: FileList): void {
    const stringReader = new FileReader();

    stringReader.onload = (e: ProgressEvent) => {
      if (stringReader.result) {
        this.imageString = stringReader.result.toString();
        this.imageData = this.imageString.split(',')[1];
      }
    };

    if (fileList[0]) {
      stringReader.readAsDataURL(fileList[0]);
    }
  }

  showPreview(id: string) {
    this.api.getDrawingPreview(id).then((sequence: DrawingSequence) => {
      this.drawPreview(sequence);
    });
  }

  async drawPreview(sequence: DrawingSequence) {
    const ratio = this.size / VIEWPORT_DIMENSION;
    const ctx: CanvasRenderingContext2D = this.preview.nativeElement.getContext('2d');
    if (ctx) {
      const totalTime = 5000;
      const timeoutOffset = 0.1;
      const timePerSegment = totalTime / sequence.stack.length;

      ctx.clearRect(0, 0, this.size, this.size);
      for (const segment of sequence.stack) {
        const segmentStart = Date.now();
        const timePerPoint = timePerSegment / segment.path.length;

        ctx.beginPath();
        ctx.strokeStyle = 'black';

        for (const [index, coord] of segment.path.entries()) {
          const c = Coordinate.copy(coord).scale(ratio);

          if (index === 0) {
            ctx.moveTo(c.x, c.y);
          } else {
            ctx.lineTo(c.x, c.y);
          }

          const now = Date.now();
          if (now < segmentStart + (timePerPoint - timeoutOffset) * index) {
            await new Promise((resolve) => {
              setTimeout(resolve, timePerPoint - (now - segmentStart + timePerPoint * index));
            });
          }
        }
        ctx.stroke();
      }
    }
  }
}
