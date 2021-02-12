import { Component, Input } from '@angular/core';
import { ChatMessage } from '../../../../../../../common/communication/chat-message';

@Component({
  selector: 'chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss'],
})
export class ChatMessageComponent {
  @Input() message: ChatMessage;

  constructor() {
    this.message = { user: '', content: '', timestamp: Date.now() };
  }
}
