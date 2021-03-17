import { NgModule } from '@angular/core';
import { SharedModule } from '@components/shared/shared.module';
import { StatusBarModule } from '@components/shared/status-bar/status-bar.module';
import { LobbyComponent } from './lobby/lobby.component';

@NgModule({
  imports: [SharedModule, StatusBarModule],
  declarations: [LobbyComponent],
})
export class LobbyModule {}
