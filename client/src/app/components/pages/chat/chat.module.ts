import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ChatComponent } from './chat/chat.component';
import {ChatMessageComponent} from './chat-message/chat-message.component';

@NgModule({
  imports: [SharedModule],
  declarations: [ChatComponent, ChatMessageComponent],
})
export class ChatModule {}

