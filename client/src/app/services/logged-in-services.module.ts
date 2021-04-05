import { NgModule } from '@angular/core';
import { GameService } from './game.service';
import { SocketService } from './socket-service.service';

@NgModule({
  providers: [SocketService, GameService],
})
export class LoggedInServicesModule {}
