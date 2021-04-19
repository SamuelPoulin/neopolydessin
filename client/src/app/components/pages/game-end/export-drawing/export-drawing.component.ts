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

  @ViewChild('preview') preview: ElementRef;

  constructor(private editorService: EditorService, dialogRef: MatDialogRef<AbstractModalComponent>) {
    super(dialogRef);

    dialogRef.afterOpened().subscribe(() => {
      this.init();
    });
  }

  async displayDrawing(svgList: string[]): Promise<void> {
    const image = new Image();
    const ctx: CanvasRenderingContext2D = this.preview.nativeElement.getContext('2d');

    const gif = new GIF({
      workerScript: '/assets/gif.worker.js',
      repeat: 0,
      width: this.size,
      height: this.size,
    });

    if (ctx) {
      for (const svg of svgList) {
        image.onload = (): void => {
          ctx.clearRect(0, 0, this.size, this.size);
          ctx.drawImage(image, 0, 0);
          gif.addFrame(ctx, { delay: 50, copy: true });
        };
        image.src = svg;
        await new Promise((resolve) => {
          setTimeout(resolve, EditorService.SNAPSHOT_INTERVAL); // todo - add variable
        });
      }
      gif.on('finished', (blob) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          console.log(reader.result);
        };
      });

      gif.render();
    }
  }

  private init() {
    this.editorService.gameService.gameEnded.emit();
    console.log(this.editorService.recordedDrawings);
    this.displayDrawing(this.editorService.recordedDrawings[0]);
  }
}
