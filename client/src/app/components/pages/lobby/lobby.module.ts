import { NgModule } from '@angular/core';
import { SharedModule } from '@components/shared/shared.module';
import { LobbyComponent } from './lobby/lobby.component';

@NgModule({
  imports: [SharedModule],
  declarations: [LobbyComponent],
})
export class LobbyModule {}
