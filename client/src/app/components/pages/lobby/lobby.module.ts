import { NgModule } from '@angular/core';
import { SharedModule } from '@components/shared/shared.module';
import { StatusBarModule } from '@components/shared/status-bar/status-bar.module';
import { LoggedInServicesModule } from '@services/logged-in-services.module';
import { LobbyComponent } from './lobby/lobby.component';

@NgModule({
  imports: [SharedModule, StatusBarModule, LoggedInServicesModule],
  declarations: [LobbyComponent],
})
export class LobbyModule {}
