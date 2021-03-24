import { NgModule } from '@angular/core';
import { StatusBarModule } from '@components/shared/status-bar/status-bar.module';
import { ToolbarModule } from 'src/app/components/pages/editor/toolbar/toolbar.module';
import { SharedModule } from '../../shared/shared.module';
import { ChatModule } from '../chat/chat.module';
import { DrawingSurfaceComponent } from './drawing-surface/drawing-surface.component';
import { GridComponent } from './drawing-surface/grid/grid.component';
import { EditorComponent } from './editor/editor.component';

@NgModule({
  imports: [SharedModule, ToolbarModule, StatusBarModule, ChatModule],
  declarations: [DrawingSurfaceComponent, EditorComponent, GridComponent],
  exports: [DrawingSurfaceComponent, EditorComponent],
})
export class EditorModule {}
