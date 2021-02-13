import { NgModule } from '@angular/core';
import { UserGuideModalComponent } from 'src/app/components/pages/user-guide/user-guide/user-guide-modal.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [SharedModule],
  declarations: [UserGuideModalComponent],
})
export class UserGuideModule {}
