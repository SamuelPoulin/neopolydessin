import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { EditorModule } from '@components/pages/editor/editor.module';
import { EditorComponent } from '@components/pages/editor/editor/editor.component';
import { HomeModule } from '@components/pages/home/home.module';
import { HomeComponent } from '@components/pages/home/home/home.component';
import { UserGuideModule } from '@components/pages/user-guide/user-guide.module';
import { SharedModule } from '@components/shared/shared.module';
import { UserGuideModalComponent } from 'src/app/components/pages/user-guide/user-guide/user-guide-modal.component';
import { AppComponent } from './app.component';

@NgModule({
  imports: [
    BrowserModule,
    SharedModule,
    HomeModule,
    EditorModule,
    UserGuideModule,
    RouterModule.forRoot([
      { path: '', component: HomeComponent },
      { path: 'edit', component: EditorComponent },
    ]),
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  entryComponents: [UserGuideModalComponent],
})
export class AppModule { }
