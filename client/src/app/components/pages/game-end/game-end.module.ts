import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@components/shared/shared.module';
import { StatusBarModule } from '@components/shared/status-bar/status-bar.module';
import { LoggedInServicesModule } from '@services/logged-in-services.module';
import { ChatModule } from '../chat/chat.module';
import { GameEndComponent } from './game-end/game-end.component';
import { ExportDrawingComponent } from './export-drawing/export-drawing.component';

@NgModule({
  imports: [SharedModule, StatusBarModule, RouterModule, LoggedInServicesModule, ChatModule],
  declarations: [GameEndComponent, ExportDrawingComponent],
})
export class GameEndModule {}
