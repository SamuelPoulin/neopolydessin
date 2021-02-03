import { NgModule } from '@angular/core';
import { ToolbarModule } from 'src/app/components/pages/editor/toolbar/toolbar.module';
import { SharedModule } from '../../shared/shared.module';
import { ChatProtoComponent } from './chat-proto/chat-proto/chat-proto.component';
import { DrawingSurfaceComponent } from './drawing-surface/drawing-surface.component';
import { GridComponent } from './drawing-surface/grid/grid.component';
import { EditorComponent } from './editor/editor.component';

@NgModule({
  imports: [SharedModule, ToolbarModule],
  declarations: [DrawingSurfaceComponent, EditorComponent, GridComponent, ChatProtoComponent],
  exports: [DrawingSurfaceComponent, EditorComponent],
})
export class EditorModule {}
