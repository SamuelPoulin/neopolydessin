/* eslint-disable max-lines */
import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AbstractModalComponent } from '@components/shared/abstract-modal/abstract-modal.component';
import { APIService } from '@services/api.service';
import { PictureWordDrawing, PictureWordPath, PictureWordPicture, UpdatePictureWord } from '@common/communication/picture-word';
import { Difficulty } from '@common/communication/lobby';
import { DrawMode } from '@common/communication/draw-mode';
import { Color } from '@utils/color/color';
import { DrawingSequence, Segment } from '@common/communication/drawing-sequence';
import { Coordinate } from '@utils/math/coordinate';
import { VIEWPORT_DIMENSION } from '@common/communication/viewport';
import { EditorService } from '@services/editor.service';
import { BaseShape } from '@models/shapes/base-shape';
import { Path } from '@models/shapes/path';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ImageString } from '@utils/color/image-string';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-picture-word-upload',
  templateUrl: './picture-word-upload.component.html',
  styleUrls: ['./picture-word-upload.component.scss'],
})
export class PictureWordUploadComponent extends AbstractModalComponent {
  static readonly DEFAULT_THRESHOLD: number = 200;

  readonly size: number = 500;
  readonly minimumHints: number = 3;
  drawingId: string = '';
  displayPreview: boolean = false;
  saveDrawing: boolean = false;
  imageString: SafeResourceUrl = ImageString.WHITE;
  sequence: DrawingSequence;
  previewTimeout: NodeJS.Timeout;

  word: string = '';
  displayedHints: { value: string }[] = [];
  difficulty: Difficulty;
  drawMode: DrawMode;
  _color: Color;
  imageData: string = '';
  threshold: number = PictureWordUploadComponent.DEFAULT_THRESHOLD;
  thresholdChanged: boolean = false;

  drawModes: { name: string; value: string }[] = [
    { name: 'Conventionnel', value: DrawMode.CONVENTIONAL },
    { name: 'Aléatoire', value: DrawMode.RANDOM },
    { name: 'Gauche à droite', value: DrawMode.PAN_L_TO_R },
    { name: 'Droite à gauche', value: DrawMode.PAN_R_TO_L },
    { name: 'Haut en bas', value: DrawMode.PAN_T_TO_B },
    { name: 'Bas en haut', value: DrawMode.PAN_B_TO_T },
    { name: 'Centré', value: DrawMode.CENTER_FIRST },
  ];
  difficulties: { name: string; value: string }[] = [
    { name: 'Facile', value: Difficulty.EASY },
    { name: 'Intermédiaire', value: Difficulty.INTERMEDIATE },
    { name: 'Difficile', value: Difficulty.HARD },
  ];

  @ViewChild('preview') preview: ElementRef;
  @ViewChild('uploadLabel') uploadLabel: ElementRef;

  get color(): string {
    return this._color.hexString;
  }

  set color(hex: string) {
    this._color = Color.hex(hex);
  }

  get hints(): string[] {
    const hints: string[] = [];
    this.displayedHints.forEach((hint) => {
      hints.push(hint.value);
    });
    return hints;
  }

  constructor(
    dialogRef: MatDialogRef<AbstractModalComponent>,
    private api: APIService,
    private editorService: EditorService,
    protected sanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
  ) {
    super(dialogRef);
    this._color = Color.BLACK;

    if (this.dialogRef.id === 'drawing') {
      const blob = new Blob([this.editorService.view.svg.outerHTML], { type: 'image/svg+xml' });
      this.imageString = sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
    }

    for (let i = 0; i < this.minimumHints; ++i) {
      this.displayedHints.push({ value: '' });
    }

    this.dialogRef
      .beforeClosed()
      .toPromise()
      .then(() => {
        if (!this.saveDrawing) this.cancel();
      });
  }

  async save(): Promise<void> {
    if (this.drawingId) {
      if (!this.thresholdChanged) {
        return this.update(this.drawingId);
      } else {
        this.thresholdChanged = false;
        this.cancel();
        this.upload();
      }
    } else {
      return this.upload();
    }
  }

  updateHint(value: string, id: number): void {
    this.displayedHints[id].value = value;
  }

  addHint(): void {
    this.displayedHints.push({ value: '' });
  }

  removeHint(id: number) {
    this.displayedHints.splice(id, 1);
  }

  onThresholdChanged(): void {
    this.thresholdChanged = true;
  }

  cancel(): void {
    if (this.drawingId) {
      this.api.deleteDrawing(this.drawingId);
    }
  }

  exit(): void {
    this.save().then(() => {
      this.saveDrawing = true;
      this.dialogRef.close();
    });
  }

  async update(id: string): Promise<void> {
    const data: UpdatePictureWord = {
      word: this.word,
      hints: this.hints,
      difficulty: this.difficulty,
      drawMode: this.drawMode,
      color: this._color.ahexString,
    };

    return this.api
      .updateDrawing(id, data)
      .then((sequence) => {
        this.displayPreview = true;
        this.sequence = sequence;
        this.drawPreview(sequence);
      })
      .catch(() => this.showError());
  }

  async upload(): Promise<void> {
    const upload = this.dialogRef.id === 'drawing' ? this.uploadDrawing() : this.uploadPicture();

    return upload
      .then((id) => {
        this.drawingId = id;
        this.showPreview(id);
      })
      .catch(() => this.showError());
  }

  private async uploadDrawing(): Promise<string> {
    const paths: PictureWordPath[] = [];

    this.editorService.shapes.forEach((shape: BaseShape) => {
      if (shape instanceof Path) {
        const points: Coordinate[] = [];

        shape.points.forEach((point) => {
          points.push(point.scale(this.editorService.scalingToServer));
        });

        paths.push({
          brushInfo: { color: shape.primaryColor.ahexString, strokeWidth: shape.strokeWidth },
          id: shape.id.toString(),
          path: points,
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
      color: this._color.ahexString,
      threshold: this.threshold,
      picture: this.imageData,
    };

    return this.api.uploadPicture(data);
  }

  togglePreview(): void {
    this.displayPreview = !this.displayPreview;
    if (this.displayPreview && this.sequence) this.drawPreview(this.sequence);
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
    this.api
      .getDrawingPreview(id)
      .then((sequence: DrawingSequence) => {
        this.sequence = sequence;
        this.displayPreview = true;
        this.drawPreview(sequence);
      })
      .catch(() => this.showError());
  }

  showError() {
    this.snackBar.open('Erreur lors de la création', 'Ok', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  drawPreview(sequence: DrawingSequence) {
    if (this.previewTimeout) clearTimeout(this.previewTimeout);

    if (this.dialogRef.id === 'drawing') {
      this.drawingPreview(sequence);
    } else {
      this.imagePreview(sequence);
    }
  }

  async imagePreview(sequence: DrawingSequence) {
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
        ctx.strokeStyle = Color.ahex(segment.brushInfo.color).rgbaString;
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
              this.previewTimeout = setTimeout(resolve, timePerPoint - (now - segmentStart + timePerPoint * index));
            });
            ctx.stroke();
          }
        }
        ctx.stroke();
      }
    }
  }

  async drawingPreview(sequence: DrawingSequence) {
    const ctx: CanvasRenderingContext2D = this.preview.nativeElement.getContext('2d');
    if (ctx) {
      const totalTime = 5000;
      const timeoutOffset = 0.1;
      const timePerSegment = totalTime / sequence.stack.length;

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const segments: Segment[] = [];

      for (const segment of sequence.stack) {
        const segmentStart = Date.now();
        const timePerPoint = timePerSegment / segment.path.length;

        segments.push(segment);
        segments.sort((a, b): number => {
          return a.zIndex - b.zIndex;
        });

        for (const [index] of segment.path.entries()) {
          ctx.clearRect(0, 0, this.size, this.size);
          segments.forEach((path) => {
            if (path === segment) {
              this.drawPath(ctx, path, index);
            } else {
              this.drawPath(ctx, path);
            }
          });

          const now = Date.now();
          if (now < segmentStart + (timePerPoint - timeoutOffset) * index) {
            await new Promise((resolve) => {
              this.previewTimeout = setTimeout(resolve, timePerPoint - (now - segmentStart + timePerPoint * index));
            });
          }
        }
      }
    }
  }

  drawPath(ctx: CanvasRenderingContext2D, segment: Segment, limit: number = 0) {
    const ratio = this.size / VIEWPORT_DIMENSION;
    ctx.beginPath();
    ctx.strokeStyle = Color.ahex(segment.brushInfo.color).rgbaString;
    ctx.lineWidth = segment.brushInfo.strokeWidth;
    for (const [index, coord] of segment.path.entries()) {
      if (!limit || index <= limit) {
        const c = Coordinate.copy(coord).scale(ratio);
        if (index === 0) {
          ctx.moveTo(c.x, c.y);
        } else {
          ctx.lineTo(c.x, c.y);
        }
      }
    }
    ctx.stroke();
  }
}
