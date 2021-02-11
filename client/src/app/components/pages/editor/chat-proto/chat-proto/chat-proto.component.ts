import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { AbstractModalComponent } from '@components/shared/abstract-modal/abstract-modal.component';
import { SocketService } from '@services/socket-service.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-proto',
  templateUrl: './chat-proto.component.html',
  styleUrls: ['./chat-proto.component.scss'],
})
export class ChatProtoComponent extends AbstractModalComponent implements OnInit {
  @ViewChild('list', { static: false }) list: ElementRef;
  @ViewChild('scroll', { static: false }) scroll: ElementRef;
  ioServiceSub: Subscription;
  message: string;

  constructor(private socketService: SocketService, dialogRef: MatDialogRef<AbstractModalComponent>, private renderer: Renderer2) {
    super(dialogRef);
  }

  ngOnInit(): void {
    this.createIoComponentConnection();
  }

  SendMessage(): void {
    this.socketService.sendMessage(this.message);
    this.addMsgToChat('tempPlayerName', this.message);
    this.message = '';
  }

  private createIoComponentConnection(): void {
    this.ioServiceSub = this.socketService.receiveMessage().subscribe((message: Object) => {
      this.addMsgToChat('received', (message as any).msg);
      this.scrollToBottom();
    });
  }

  private addMsgToChat(playerName: string, message: string): void {
    const msgToAdd = this.renderer.createElement('li');
    msgToAdd.innerHTML = playerName + ': ' + message;
    this.renderer.appendChild(this.list.nativeElement, msgToAdd);
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    this.scroll.nativeElement.scrollTop = this.scroll.nativeElement.scrollHeight;
  }
}
