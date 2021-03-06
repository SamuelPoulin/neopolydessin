import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@components/shared/shared.module';
import { StatusBarModule } from '@components/shared/status-bar/status-bar.module';
import { LoggedInServicesModule } from '@services/logged-in-services.module';
import { ChatModule } from '../chat/chat.module';
import { HomeComponent } from './home/home.component';
import { HomeGamemodeComponent } from './home-gamemode/home-gamemode.component';

@NgModule({
  imports: [SharedModule, StatusBarModule, RouterModule, LoggedInServicesModule, ChatModule],
  declarations: [HomeComponent, HomeGamemodeComponent],
})
export class HomeModule {}
