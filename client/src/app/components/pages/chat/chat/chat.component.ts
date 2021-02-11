import { Component, OnInit } from "@angular/core";
import { ChatMessage } from "@models/chat-message/chat-message";
import { SocketService } from "@services/socket-service.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.scss"],
})
export class ChatComponent implements OnInit {
  subscription: Subscription;
  messages: ChatMessage[] = [];
  inputValue: string = "";

  constructor(private socketService: SocketService) {}

  ngOnInit() {
    this.subscribe();
  }

  subscribe() {
    this.subscription = this.socketService
      .receiveMessage()
      .subscribe((message: Object) => {
        this.messages.push({
          user: "foreign",
          content: (message as any).msg,
          timestamp: new Date(),
        });
        this.scrollToBottom();
      });
  }

  sendMessage() {
    this.socketService.sendMessage(this.inputValue);
    this.messages.push({
      user: "user",
      content: this.inputValue,
      timestamp: new Date(),
    });
    setTimeout(() => {
      this.inputValue = "";
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
