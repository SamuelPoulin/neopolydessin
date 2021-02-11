import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ChatMessageComponent } from './chat-message/chat-message.component';
import { ChatComponent } from './chat/chat.component';

@NgModule({
  imports: [SharedModule],
  declarations: [ChatComponent, ChatMessageComponent],
})
export class ChatModule {}
