import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Drawing } from 'src/app/models/drawing';
import { APIService } from 'src/app/services/api.service';

@Component({
  selector: 'app-gallery-drawing',
  templateUrl: './gallery-drawing.component.html',
  styleUrls: ['./gallery-drawing.component.scss'],
})
export class GalleryDrawingComponent {
  @Output() chosen: EventEmitter<Drawing>;
  @Input() drawing: Drawing;
  deleted: boolean;

  constructor(private sanitizer: DomSanitizer, private apiService: APIService) {
    this.deleted = false;
    this.chosen = new EventEmitter<Drawing>();
  }

  get previewURL(): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.drawing.previewURL);
  }

  delete(): void {
    this.apiService.deleteDrawing(this.drawing._id);
    this.deleted = true;
  }

  choose(): void {
    this.chosen.emit(this.drawing);
  }
}
