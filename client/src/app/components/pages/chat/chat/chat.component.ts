import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { EmojiEvent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { ChatService } from '@services/chat.service';
import { UserService } from '@services/user.service';
import { ElectronService } from 'ngx-electron';
import { Subscription } from 'rxjs';
import { ChatMessage, Message } from '../../../../../../../common/communication/chat-message';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
  private static MAX_CHARACTER_COUNT: number;

  readonly correctColor: string = '#38B000';
  readonly iconColor: string = '#2196f3';

  inputValue: string = '';
  emojiMartOpen: boolean = false;

  readonly spamMaximum: number = 5;
  readonly spamResetDelay: number = 3000;
  spamCounter: number;

  chatRoomChangedSubscription: Subscription;
  isElectronApp: boolean;

  constructor(
    private snackBar: MatSnackBar,
    private electronService: ElectronService,
    private chatService: ChatService,
    public userService: UserService,
    public dialog: MatDialog,
    public router: Router,
  ) {
    ChatComponent.MAX_CHARACTER_COUNT = 200;
    this.spamCounter = 0;

    this.chatRoomChangedSubscription = this.chatService.chatRoomChanged.subscribe(() => {
      this.scrollToBottom();
    });

    if (this.electronService.isElectronApp) {
      this.isElectronApp = true;
    }
  }

  sendMessage(): void {
    if (this.spamCounter === 0) {
      setTimeout(() => {
        this.spamCounter = 0;
      }, this.spamResetDelay);
    }
    if (this.inputValid) {
      this.spamCounter++;
      if (this.chatService.chatState.guessing) {
        this.chatService.sendGuess(this.inputValue);
      } else {
        this.chatService.sendMessage(this.inputValue);
      }
      this.inputValue = '';
      this.scrollToBottom();
    }
  }

  get inputValid(): boolean {
    if (this.inputValue.replace(/ /g, '')) {
      if (this.inputValue.length < ChatComponent.MAX_CHARACTER_COUNT) {
        if (this.spamCounter < this.spamMaximum) {
          return true;
        } else {
          this.sendNotification('Vous avez envoyer trop de message r??cemment');
        }
      } else {
        this.sendNotification('Le message ne doit pas d??passer 200 caract??res.');
      }
    } else {
      this.sendNotification('Le message est vide.');
    }

    return false;
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const chatMessages = document.querySelector('#chat-messages');

      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
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

  toggleGuessMode(): void {
    this.chatService.toggleGuessMode();
  }

  toggleFriendslist() {
    this.chatService.toggleFriendslist();
  }

  toggleChatRooms() {
    this.chatService.toggleChatRooms();
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

  get standalone(): boolean {
    return this.chatService.standalone;
  }

  get guessing(): boolean {
    return this.chatService.chatState.guessing;
  }

  get messages(): Message[] {
    return this.chatService.messages;
  }

  get friendslistOpened(): boolean {
    return this.chatService.chatState.friendslistOpened;
  }

  get chatRoomsOpened(): boolean {
    return this.chatService.chatState.chatRoomsOpened;
  }

  get canGuess(): boolean {
    return this.chatService.canGuess;
  }

  sendNotification(message: string) {
    this.snackBar.open(message, 'Ok', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  popout() {
    this.chatService.popOut();
  }
}
