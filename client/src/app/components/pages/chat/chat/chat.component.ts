import { Component } from "@angular/core";
import { ChatMessage } from "@models/chat-message/chat-message";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.scss"],
})
export class ChatComponent {
  messages: ChatMessage[] = [];

  sendMessage() {
    this.messages.push({
      user: "123",
      content: "What a joke you are",
      timestamp: new Date(),
    });
    setTimeout(() => {
      this.scrollToBottom();
    });
  }

  scrollToBottom() {
    let electronContainer = document.querySelector(".container-after-titlebar");

    if (electronContainer) {
      electronContainer.scrollTop = electronContainer.scrollHeight;
    } else {
      window.scrollTo(0, document.body.scrollHeight);
    }
  }
}
