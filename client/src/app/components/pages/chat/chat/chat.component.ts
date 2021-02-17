import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SocketService } from '@services/socket-service.service';
import { UserService } from '@services/user.service';
import { Subscription } from 'rxjs';
import { ChatMessage, Message } from '../../../../../../../common/communication/chat-message';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  messageSubscription: Subscription;
  playerConnectionSubscription: Subscription;
  playerDisconnectionSubscription: Subscription;

  messages: Message[] = [];
  inputValue: string = '';

  constructor(private socketService: SocketService, private router: Router, public userService: UserService, public dialog: MatDialog) {
    if (!this.userService.username) this.router.navigate(['login']);
  }

  ngOnInit(): void {
    this.subscribe();
  }

  subscribe(): void {
    this.messageSubscription = this.socketService.receiveMessage().subscribe((message) => {
      this.messages.push(message);
      this.scrollToBottom();
    });

    this.playerConnectionSubscription = this.socketService.receivePlayerConnections().subscribe((message) => {
      this.messages.push(message);
      this.scrollToBottom();
    });

    this.playerDisconnectionSubscription = this.socketService.receivePlayerDisconnections().subscribe((message) => {
      this.messages.push(message);
      this.scrollToBottom();
    });
  }

  sendMessage(): void {
    if (this.inputValue) {
      this.socketService.sendMessage({
        user: this.userService.username,
        content: this.inputValue,
        timestamp: Date.now(),
      });
      this.messages.push({
        user: this.userService.username,
        content: this.inputValue,
        timestamp: Date.now(),
      } as ChatMessage);
      this.inputValue = '';
      this.scrollToBottom();
    }
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.electronContainer) {
        this.electronContainer.scrollTop = this.electronContainer.scrollHeight;
      } else {
        window.scrollTo(0, document.body.scrollHeight);
      }
    });
  }

  isSystem(message: Message): message is ChatMessage {
    return !(message as ChatMessage).user;
  }

  get electronContainer(): Element | null {
    return document.querySelector('.container-after-titlebar');
  }
}
