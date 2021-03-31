import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { SharedModule } from '../../shared/shared.module';
import { ChatMessageComponent } from './chat-message/chat-message.component';
import { ChatComponent } from './chat/chat.component';
import { SystemMessageComponent } from './system-message/system-message.component';
import { ChatTabsComponent } from './chat-tabs/chat-tabs.component';
import { ChatTabComponent } from './chat-tab/chat-tab.component';

@NgModule({
  imports: [SharedModule, PickerModule],
  declarations: [ChatComponent, ChatMessageComponent, SystemMessageComponent, ChatTabsComponent, ChatTabComponent],
  exports: [ChatComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ChatModule {}
