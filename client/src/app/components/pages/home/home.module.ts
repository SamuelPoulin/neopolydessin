import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { CreateDrawingModalComponent } from './create-drawing-modal/create-drawing-modal.component';
import { HomeComponent } from './home/home.component';

@NgModule({
  imports: [SharedModule],
  declarations: [CreateDrawingModalComponent, HomeComponent],
  entryComponents: [CreateDrawingModalComponent],
})
export class HomeModule {}
