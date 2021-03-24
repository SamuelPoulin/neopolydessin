import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { StatusBarModule } from '@components/shared/status-bar/status-bar.module';
import { SharedModule } from '../../shared/shared.module';
import { HomeComponent } from './home/home.component';

@NgModule({
  imports: [SharedModule, StatusBarModule, RouterModule],
  declarations: [HomeComponent],
})
export class HomeModule {}
