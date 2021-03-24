import { NgModule } from '@angular/core';
import { StatusBarModule } from '@components/shared/status-bar/status-bar.module';
import { MatTableModule } from '@angular/material/table';
import { SharedModule } from '../../shared/shared.module';
import { ServerBrowserComponent } from './server-browser/server-browser.component';

@NgModule({
  imports: [SharedModule, StatusBarModule, MatTableModule],
  declarations: [ServerBrowserComponent],
})
export class ServerBrowserModule {}
