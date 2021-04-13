import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AbstractModalComponent } from '@components/shared/abstract-modal/abstract-modal.component';
import { APIService } from '@services/api.service';
import { PictureWordDrawing, PictureWordPath, PictureWordPicture } from '@common/communication/picture-word';
import { Difficulty } from '@common/communication/lobby';
import { DrawMode } from '@common/communication/draw-mode';
import { Color } from '@utils/color/color';
import { DrawingSequence } from '@common/communication/drawing-sequence';
import { Coordinate } from '@utils/math/coordinate';
import { VIEWPORT_DIMENSION } from '@common/communication/viewport';
import { EditorService } from '@services/editor.service';
import { BaseShape } from '@models/shapes/base-shape';
import { Path } from '@models/shapes/path';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ImageString } from '@utils/color/image-string';

@Component({
  selector: 'app-picture-word-upload',
  templateUrl: './picture-word-upload.component.html',
  styleUrls: ['./picture-word-upload.component.scss'],
})
export class PictureWordUploadComponent extends AbstractModalComponent {
  static readonly DEFAULT_THRESHOLD: number = 200;

  readonly size: number = 600;
  dataUploaded: boolean = false;
  displayPreview: boolean = false;
  imageString: SafeResourceUrl = ImageString.WHITE;

  word: string = '';
  hints: string[] = [];
  difficulty: Difficulty;
  drawMode: DrawMode;
  color: Color;
  imageData: string = '';
  threshold: number = PictureWordUploadComponent.DEFAULT_THRESHOLD;

  drawModes: string[] = ['conventional', 'random', 'panlr', 'panrl', 'pantb', 'panbt', 'center'];
  difficulties: string[] = ['easy', 'intermediate', 'hard'];

  @ViewChild('preview') preview: ElementRef;
  @ViewChild('uploadLabel') uploadLabel: ElementRef;

  constructor(
    dialogRef: MatDialogRef<AbstractModalComponent>,
    private api: APIService,
    private editorService: EditorService,
    protected sanitizer: DomSanitizer,
  ) {
    super(dialogRef);

    if (this.dialogRef.id === 'drawing') {
      const blob = new Blob([this.editorService.view.svg.outerHTML], { type: 'image/svg+xml' });
      this.imageString = sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
    }
  }

  async save(): Promise<void> {
    if (this.dataUploaded) {
      return this.update();
    } else {
      return this.upload();
    }
  }

  exit(): void {
    this.save().then(() => {
      this.dialogRef.close();
    });
  }

  update(): void {
    //
  }

  async upload(): Promise<void> {
    this.hints = ['1', '2', '3'];
    this.color = Color.BLACK;

    if (this.dialogRef.id === 'drawing') {
      return this.uploadDrawing().then((id) => {
        this.dataUploaded = true;
        this.showPreview(id);
      });
    } else {
      return this.uploadPicture().then((id) => {
        this.dataUploaded = true;
        this.showPreview(id);
      });
    }
  }

  private async uploadDrawing(): Promise<string> {
    const paths: PictureWordPath[] = [];

    this.editorService.shapes.forEach((shape: BaseShape) => {
      if (shape instanceof Path) {
        paths.push({
          brushInfo: { color: shape.primaryColor.ahexString, strokeWidth: shape.strokeWidth },
          id: shape.id.toString(),
          path: shape.points,
        });
      }
    });

    const data: PictureWordDrawing = {
      word: this.word,
      hints: this.hints,
      difficulty: this.difficulty,
      drawMode: this.drawMode,
      drawnPaths: paths,
    };

    return this.api.uploadDrawing(data);
  }

  private async uploadPicture(): Promise<string> {
    const data: PictureWordPicture = {
      word: this.word,
      hints: this.hints,
      difficulty: this.difficulty,
      drawMode: this.drawMode,
      color: this.color.hexString,
      threshold: this.threshold,
      picture: this.imageData,
    };

    return this.api.uploadPicture(data);
  }

  togglePreview(): void {
    this.displayPreview = !this.displayPreview;
  }

  openUpload(): void {
    this.uploadLabel.nativeElement.click();
  }

  acceptFile(fileList: FileList): void {
    const stringReader = new FileReader();

    stringReader.onload = (e: ProgressEvent) => {
      if (stringReader.result) {
        const image = stringReader.result.toString();
        this.imageString = image;
        this.imageData = image.split(',')[1];
      }
    };

    if (fileList[0]) {
      stringReader.readAsDataURL(fileList[0]);
    }
  }

  showPreview(id: string) {
    this.api.getDrawingPreview(id).then((sequence: DrawingSequence) => {
      this.displayPreview = true;
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
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (const segment of sequence.stack) {
        const segmentStart = Date.now();
        const timePerPoint = timePerSegment / segment.path.length;

        ctx.beginPath();
        ctx.strokeStyle = Color.ahex(segment.brushInfo.color).rgbString;
        ctx.lineWidth = segment.brushInfo.strokeWidth;

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
            ctx.stroke();
          }
        }
        ctx.stroke();
      }
    }
  }
}
