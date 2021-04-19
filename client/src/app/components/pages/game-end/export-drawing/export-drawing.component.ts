import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AbstractModalComponent } from '@components/shared/abstract-modal/abstract-modal.component';
import { EditorService } from '@services/editor.service';

@Component({
  selector: 'app-export-drawing',
  templateUrl: './export-drawing.component.html',
  styleUrls: ['./export-drawing.component.scss'],
})
export class ExportDrawingComponent extends AbstractModalComponent {
  readonly size: number = 500;

  constructor(private editorService: EditorService, dialogRef: MatDialogRef<AbstractModalComponent>) {
    super(dialogRef);

    dialogRef.afterOpened().subscribe(() => {
      this.init();
    });
  }

  private init() {
    this.editorService.gameService.gameEnded.emit();
    console.log(this.editorService.recordedDrawings);
  }
}
