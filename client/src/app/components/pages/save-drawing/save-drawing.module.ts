import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { SaveDrawingModalComponent } from './save-drawing/save-drawing-modal.component';

@NgModule({
  imports: [SharedModule],
  declarations: [SaveDrawingModalComponent],
  entryComponents: [SaveDrawingModalComponent],
})
export class SaveDrawingModule {}
