import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/components/shared/shared.module';
import { ChooseExportSaveModalComponent } from './choose-export-save/choose-export-save-modal.component';

@NgModule({
  imports: [SharedModule],
  declarations: [ChooseExportSaveModalComponent],
  entryComponents: [ChooseExportSaveModalComponent],
})
export class ChooseExportSaveModule {}
