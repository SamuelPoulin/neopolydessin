import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { CreateDrawingModalComponent } from './create-drawing-modal/create-drawing-modal.component';
import { HomeComponent } from './home/home.component';

@NgModule({
  imports: [SharedModule, RouterModule],
  declarations: [CreateDrawingModalComponent, HomeComponent],
})
export class HomeModule {}
