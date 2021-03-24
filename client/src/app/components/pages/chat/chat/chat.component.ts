import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { EmojiEvent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
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
  private static MAX_CHARACTER_COUNT: number;
  messageSubscription: Subscription;
  playerConnectionSubscription: Subscription;
  playerDisconnectionSubscription: Subscription;

  messages: Message[] = [];
  inputValue: string = '';
  emojiMartOpen: boolean = false;

  constructor(
    private socketService: SocketService,
    private router: Router,
    private snackBar: MatSnackBar,
    public userService: UserService,
    public dialog: MatDialog,
  ) {
    if (!this.userService.username) this.router.navigate(['login']);

    ChatComponent.MAX_CHARACTER_COUNT = 200;
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
    if (this.inputValue.replace(/ /g, '')) {
      if (this.inputValue.length < ChatComponent.MAX_CHARACTER_COUNT) {
        this.socketService.sendMessage({
          content: this.inputValue,
          timestamp: Date.now(),
        });
        this.messages.push({
          content: this.inputValue,
          timestamp: Date.now(),
        } as ChatMessage);
        this.inputValue = '';
        this.scrollToBottom();
      } else {
        this.sendNotification('Le message ne doit pas dépasser 200 caractères.');
      }
    } else {
      this.sendNotification('Le message est vide.');
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
    return !(message as ChatMessage).senderUsername;
  }

  get electronContainer(): Element | null {
    return document.querySelector('.container-after-titlebar');
  }

  toggleEmojiMart(): void {
    this.emojiMartOpen = !this.emojiMartOpen;
  }

  addEmoji(e: EmojiEvent) {
    this.inputValue += e.emoji.native;
    this.toggleEmojiMart();
  }

  get length(): number {
    return this.inputValue.length;
  }

  get maxLength(): number {
    return ChatComponent.MAX_CHARACTER_COUNT;
  }

  sendNotification(message: string) {
    this.snackBar.open(message, 'Ok', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}
