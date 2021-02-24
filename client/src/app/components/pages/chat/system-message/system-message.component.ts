import { Component, Input } from '@angular/core';
import { UserService } from '@services/user.service';
import { format } from 'date-fns';
import { Message } from '../../../../../../../common/communication/chat-message';

@Component({
  selector: 'system-message',
  templateUrl: './system-message.component.html',
  styleUrls: ['./system-message.component.scss'],
})
export class SystemMessageComponent {
  @Input() message: Message;

  constructor(public userService: UserService) {
    this.message = { content: '', timestamp: Date.now() };
  }

  get timestamp() {
    return format(new Date(this.message.timestamp), 'H:mm:ss');
  }
}
