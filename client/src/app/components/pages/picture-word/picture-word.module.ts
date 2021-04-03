import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { StatusBarModule } from '@components/shared/status-bar/status-bar.module';
import { SharedModule } from '../../shared/shared.module';
import { PictureWordUploadComponent } from './picture-word-upload/picture-word-upload.component';
import { PictureWordBrowserComponent } from './picture-word-browser/picture-word-browser.component';

@NgModule({
  imports: [SharedModule, StatusBarModule, RouterModule],
  declarations: [PictureWordBrowserComponent, PictureWordUploadComponent],
})
export class PictureWordModule {}
