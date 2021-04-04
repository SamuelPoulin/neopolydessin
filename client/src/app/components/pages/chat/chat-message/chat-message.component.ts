import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '@services/user.service';
import { format } from 'date-fns';
import { ChatMessage } from '../../../../../../../common/communication/chat-message';
import { GuessMessage, GuessResponse } from '../../../../../../../common/communication/lobby';

@Component({
  selector: 'chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss'],
})
export class ChatMessageComponent implements OnInit {
  @Input() message: ChatMessage;
  guessStatus: GuessResponse;
  foreign: boolean;

  constructor(public userService: UserService) {
    this.message = { senderUsername: '', content: '', timestamp: Date.now() };
  }

  ngOnInit() {
    if ((this.message as GuessMessage).guessStatus) {
      this.guessStatus = (this.message as GuessMessage).guessStatus;
    }

    if (this.message.senderUsername !== this.userService.account.username) {
      this.foreign = true;
    }
  }

  get timestamp() {
    return format(new Date(this.message.timestamp), 'H:mm:ss');
  }

  get guessResponse() {
    return GuessResponse;
  }
}
