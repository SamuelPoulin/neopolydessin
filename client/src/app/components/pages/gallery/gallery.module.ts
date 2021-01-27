import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { GalleryDrawingComponent } from './gallery-drawing/gallery-drawing.component';
import { GalleryModalComponent } from './gallery/gallery-modal.component';

@NgModule({
  imports: [SharedModule],
  declarations: [GalleryModalComponent, GalleryDrawingComponent],
  entryComponents: [GalleryModalComponent, GalleryDrawingComponent],
})
export class GalleryModule {}
