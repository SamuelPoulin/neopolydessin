import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ChooseExportSaveModule } from '@components/pages/choose-export-save/choose-export-save.module';
import { ChooseExportSaveModalComponent } from '@components/pages/choose-export-save/choose-export-save/choose-export-save-modal.component';
import { EditorModule } from '@components/pages/editor/editor.module';
import { EditorComponent } from '@components/pages/editor/editor/editor.component';
import { ExportDrawingModule } from '@components/pages/export-modal/export-modal.module';
import { ExportModalComponent } from '@components/pages/export-modal/export-modal/export-modal.component';
import { GalleryModule } from '@components/pages/gallery/gallery.module';
import { HomeModule } from '@components/pages/home/home.module';
import { HomeComponent } from '@components/pages/home/home/home.component';
import { SaveDrawingModule } from '@components/pages/save-drawing/save-drawing.module';
import { SaveDrawingModalComponent } from '@components/pages/save-drawing/save-drawing/save-drawing-modal.component';
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
    SaveDrawingModule,
    ChooseExportSaveModule,
    ExportDrawingModule,
    GalleryModule,
    RouterModule.forRoot([
      { path: '', component: HomeComponent },
      { path: 'edit', component: EditorComponent },
    ]),
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  entryComponents: [UserGuideModalComponent, SaveDrawingModalComponent, ExportModalComponent, ChooseExportSaveModalComponent],
})
export class AppModule {}
