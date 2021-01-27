import { AfterViewInit, Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Router } from '@angular/router';
import { EditorParams } from '@components/pages/editor/editor/editor-params';
import { AbstractModalComponent } from 'src/app/components/shared/abstract-modal/abstract-modal.component';
import { Drawing } from 'src/app/models/drawing';
import { APIService } from 'src/app/services/api.service';

@Component({
  selector: 'app-gallery-modal',
  templateUrl: './gallery-modal.component.html',
  styleUrls: ['./gallery-modal.component.scss'],
})
export class GalleryModalComponent extends AbstractModalComponent implements AfterViewInit {
  drawings: Drawing[];
  nameQuery: string;
  tagsQuery: string;
  isLoading: boolean;

  constructor(public dialogRef: MatDialogRef<AbstractModalComponent>, private apiService: APIService, private router: Router) {
    super(dialogRef);

    this.drawings = [];
    this.nameQuery = '';
    this.tagsQuery = '';
    this.isLoading = true;
  }

  ngAfterViewInit(): void {
    this.fetchDrawings();
  }

  updateDrawings(): void {
    this.isLoading = true;
    this.apiService.searchDrawings(this.nameQuery, this.tagsQuery.replace(/ /g, '')).then((drawings) => {
      this.isLoading = false;
      this.drawings = drawings;
    });
  }

  fetchDrawings(): void {
    this.isLoading = true;
    this.apiService.getAllDrawings().then((drawings) => {
      this.isLoading = false;
      this.drawings = drawings;
    });
  }

  chooseDrawing(drawing: Drawing): void {
    const params: EditorParams = {
      width: drawing.width.toString(),
      height: drawing.height.toString(),
      color: drawing.color,
      id: drawing._id,
    };
    this.router.navigate(['/'], { skipLocationChange: true }).then(() => this.router.navigate(['edit', params]));
    this.dialogRef.close();
  }
}
