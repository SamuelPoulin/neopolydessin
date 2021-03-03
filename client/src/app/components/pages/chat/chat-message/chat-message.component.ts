import { Component, Input } from '@angular/core';
import { UserService } from '@services/user.service';
import { format } from 'date-fns';
import { ChatMessage } from '../../../../../../../common/communication/chat-message';

@Component({
  selector: 'chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss'],
})
export class ChatMessageComponent {
  @Input() message: ChatMessage;

  constructor(public userService: UserService) {
    this.message = { senderAccountId: '', content: '', timestamp: Date.now() };
  }

  get timestamp() {
    return format(new Date(this.message.timestamp), 'H:mm:ss');
  }
}
