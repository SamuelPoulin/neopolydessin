import { Component, OnInit } from '@angular/core';
import { SocketService } from '@services/socket-service.service';
import { Subscription } from 'rxjs';
import { ChatMessage } from '../../../../../../../common/communication/chat-message';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  subscription: Subscription;
  messages: ChatMessage[] = [];
  inputValue: string = '';

  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    this.subscribe();
  }

  subscribe(): void {
    this.subscription = this.socketService
      .receiveMessage()
      .subscribe((message: ChatMessage) => {
        this.messages.push({user: 'foreign', content: message.content, timestamp: message.timestamp});
        this.scrollToBottom();
      });
  }

  sendMessage(): void {
    this.socketService.sendMessage({user: 'user', content: this.inputValue, timestamp: Date.now()});
    this.messages.push({
      user: 'user',
      content: this.inputValue,
      timestamp: Date.now(),
    });
    this.inputValue = '';
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const electronContainer = document.querySelector('.container-after-titlebar');

      if (electronContainer) {
        electronContainer.scrollTop = electronContainer.scrollHeight;
      } else {
        window.scrollTo(0, document.body.scrollHeight);
      }
    });
  }
}
