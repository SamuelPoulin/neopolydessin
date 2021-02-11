import { Component } from '@angular/core';
import { ChatMessage } from '../../../../../../../common/communication/chat-message';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
  messages: ChatMessage[] = [{ user: '123', content: 'Haha tu es tellement bon', timestamp: Date.now() }];

  sendMessage() {
    this.messages.push({
      user: 'user',
      content: 'What a joke you are',
      timestamp: Date.now(),
    });
    setTimeout(() => {
      this.scrollToBottom();
    });
  }

  scrollToBottom() {
    let electronContainer = document.querySelector('.container-after-titlebar');

    if (electronContainer) {
      electronContainer.scrollTop = electronContainer.scrollHeight;
    } else {
      window.scrollTo(0, document.body.scrollHeight);
    }
  }
}
