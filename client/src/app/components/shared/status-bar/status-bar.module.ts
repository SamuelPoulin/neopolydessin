import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared.module';
import { StatusBarComponent } from './status-bar/status-bar.component';

@NgModule({
  imports: [SharedModule, RouterModule],
  declarations: [StatusBarComponent],
  exports: [StatusBarComponent],
})
export class StatusBarModule {}
