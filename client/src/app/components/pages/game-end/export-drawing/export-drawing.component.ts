import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AbstractModalComponent } from '@components/shared/abstract-modal/abstract-modal.component';
import { EditorService } from '@services/editor.service';
import GIF from 'gif.js';

@Component({
  selector: 'app-export-drawing',
  templateUrl: './export-drawing.component.html',
  styleUrls: ['./export-drawing.component.scss'],
})
export class ExportDrawingComponent extends AbstractModalComponent {
  readonly size: number = 500;
  private readonly previewInterval: number = 20;
  private previewTimeout: NodeJS.Timeout;

  previewId: number = 0;
  dataStrings: string[] = [];
  isLoading: boolean = false;

  get downloadString(): string {
    return this.dataStrings[this.previewId];
  }

  @ViewChild('preview') preview: ElementRef;
  @ViewChild('canvas') canvas: ElementRef;

  constructor(public editorService: EditorService, dialogRef: MatDialogRef<AbstractModalComponent>) {
    super(dialogRef);

    dialogRef.afterOpened().subscribe(() => {
      this.init();
    });
  }

  cyclePreviews(direction: number) {
    this.previewId += direction;
    this.previewId = Math.max(Math.min(this.previewId, this.editorService.recordedDrawings.length - 1), 0);

    this.displayDrawing(this.editorService.recordedDrawings[this.previewId]);
  }

  private async init() {
    this.previewId = 0;
    this.dataStrings = [];
    this.isLoading = false;

    this.displayDrawing(this.editorService.recordedDrawings[this.previewId]);
  }

  async download() {
    if (this.editorService.recordedDrawings.length === 0) return;
    this.isLoading = true;
    const data = await this.exportDrawing(this.editorService.recordedDrawings[this.previewId]);

    const link = document.createElement('a');
    link.style.display = 'none';
    link.setAttribute('download', 'dessin-' + this.previewId);
    link.setAttribute('href', data);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.isLoading = false;
  }

  async exportDrawing(svgList: string[]): Promise<string> {
    const image = new Image();
    const canvas = document.createElement('canvas');
    canvas.width = this.size;
    canvas.height = this.size;
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;

    const gif = new GIF({
      workerScript: 'assets/gif.worker.js',
      repeat: 0,
      width: this.size,
      height: this.size,
    });

    return new Promise(async (resolve) => {
      for (const svg of svgList) {
        await new Promise<void>((loaded) => {
          image.onload = (): void => {
            ctx.clearRect(0, 0, this.size, this.previewInterval);
            ctx.drawImage(image, 0, 0);
            gif.addFrame(ctx, { delay: 50, copy: true });
            loaded();
          };
          image.src = svg;
        });
      }
      gif.on('finished', (blob) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
      });
      gif.render();
    });
  }

  async displayDrawing(svgList: string[]): Promise<void> {
    if (this.previewTimeout) clearTimeout(this.previewTimeout);
    if (this.editorService.recordedDrawings.length === 0) return;

    const image = new Image();
    const ctx: CanvasRenderingContext2D = this.preview.nativeElement.getContext('2d');

    if (ctx) {
      for (const svg of svgList) {
        image.onload = (): void => {
          ctx.clearRect(0, 0, this.size, this.size);
          ctx.drawImage(image, 0, 0);
        };
        image.src = svg;
        await new Promise((resolve) => {
          this.previewTimeout = setTimeout(resolve, this.previewInterval);
        });
      }
    }
  }
}
