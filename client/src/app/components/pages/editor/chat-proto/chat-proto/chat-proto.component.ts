import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AbstractModalComponent } from '@components/shared/abstract-modal/abstract-modal.component';
import { SocketService } from '@services/socket-service.service';
import { Subscription } from 'rxjs';
import { ChatMessage } from '../../../../../../../../common/communication/chat-message';

@Component({
  selector: 'app-chat-proto',
  templateUrl: './chat-proto.component.html',
  styleUrls: ['./chat-proto.component.scss'],
})
export class ChatProtoComponent extends AbstractModalComponent implements OnInit {
  @ViewChild('list') list: ElementRef;
  @ViewChild('scroll') scroll: ElementRef;
  ioServiceSub: Subscription;
  message: string;

  constructor(private socketService: SocketService, dialogRef: MatDialogRef<AbstractModalComponent>, private renderer: Renderer2) {
    super(dialogRef);
  }

  ngOnInit(): void {
    this.createIoComponentConnection();
  }

  sendMessage(): void {
    const msgToSend: ChatMessage = { user: 'allo', content: this.message, timestamp: Date.now() };
    this.socketService.sendMessage(msgToSend);
    this.addMsgToChat(msgToSend);
    this.message = '';
  }

  private createIoComponentConnection(): void {
    this.ioServiceSub = this.socketService.receiveMessage().subscribe((message: ChatMessage) => {
      this.addMsgToChat(message);
      this.scrollToBottom();
    });
  }

  private addMsgToChat(message: ChatMessage): void {
    const msgToAdd = this.renderer.createElement('li');
    console.log(message);

    const date = new Date(message.timestamp);

    console.log(`${message.user} ${date.getHours()}:${date.getMinutes()} : ${message.content}`);

    msgToAdd.innerHtml = message.user + date.getHours() + ':' + date.getMinutes() + ' : ' + message.content;

    this.renderer.appendChild(this.list.nativeElement, msgToAdd);
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    this.scroll.nativeElement.scrollTop = this.scroll.nativeElement.scrollHeight;
  }
}
