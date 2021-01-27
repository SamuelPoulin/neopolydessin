import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ExportModalComponent } from './export-modal/export-modal.component';

@NgModule({
  imports: [SharedModule],
  declarations: [ExportModalComponent],
  entryComponents: [ExportModalComponent],
})
export class ExportDrawingModule {}
