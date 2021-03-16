import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { HomeComponent } from './home/home.component';

@NgModule({
  imports: [SharedModule, RouterModule],
  declarations: [HomeComponent],
})
export class HomeModule {}
