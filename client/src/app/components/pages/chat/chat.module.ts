import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ChatMessageComponent } from './chat-message/chat-message.component';
import { ChatComponent } from './chat/chat.component';
import { SystemMessageComponent } from './system-message/system-message.component';

@NgModule({
  imports: [SharedModule],
  declarations: [ChatComponent, ChatMessageComponent, SystemMessageComponent],
})
export class ChatModule {}
