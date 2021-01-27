import { NgModule } from '@angular/core';
import { EraserToolbarComponent } from 'src/app/components/pages/editor/toolbar/eraser-toolbar/eraser-toolbar.component';
import { PenToolbarComponent } from 'src/app/components/pages/editor/toolbar/pen-toolbar/pen-toolbar.component';
import { ToolbarComponent } from 'src/app/components/pages/editor/toolbar/toolbar/toolbar.component';
import { SharedModule } from 'src/app/components/shared/shared.module';
import { GridToolbarComponent } from './grid-toolbar/grid-toolbar.component';

@NgModule({
  declarations: [
    ToolbarComponent,
    PenToolbarComponent,
    EraserToolbarComponent,
    GridToolbarComponent,
  ],
  imports: [SharedModule],
  exports: [ToolbarComponent],
})
export class ToolbarModule { }
