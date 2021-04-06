import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@components/shared/shared.module';
import { StatusBarModule } from '@components/shared/status-bar/status-bar.module';
import { LoggedInServicesModule } from '@services/logged-in-services.module';
import { HomeComponent } from './home/home.component';

@NgModule({
  imports: [SharedModule, StatusBarModule, RouterModule, LoggedInServicesModule],
  declarations: [HomeComponent],
})
export class HomeModule {}
