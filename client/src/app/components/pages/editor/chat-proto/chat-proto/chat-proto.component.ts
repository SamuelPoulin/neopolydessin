import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { AbstractModalComponent } from '@components/shared/abstract-modal/abstract-modal.component';
import { SocketService } from '@services/socket-service.service';

@Component({
  selector: 'app-chat-proto',
  templateUrl: './chat-proto.component.html',
  styleUrls: ['./chat-proto.component.scss']
})
export class ChatProtoComponent extends AbstractModalComponent implements OnInit {

  @ViewChild('list', { static: false}) list:ElementRef;
  @ViewChild('scroll', { static: false}) scroll:ElementRef;
  ioServiceSub: any;
  message: string;
  constructor(private socketService: SocketService, 
    dialogRef: MatDialogRef<AbstractModalComponent>,
    private renderer: Renderer2) { 
    super(dialogRef);
  }

  ngOnInit() {
    this.createIoComponentConnection();
  }

  private createIoComponentConnection(): void {
    this.ioServiceSub = this.socketService.receiveMessage().subscribe((message: any) => {
      this.addMsgToChat("received", message.msg);
      this.scrollToBottom();
    });
  }

  private addMsgToChat(playerName: string, message: string) {
    const msgToAdd = this.renderer.createElement("li");
    msgToAdd.innerHTML = playerName + ": " + message;
    this.renderer.appendChild(this.list.nativeElement, msgToAdd);
    this.scrollToBottom();
  }

  public SendMessage(): void {
    this.socketService.sendMessage(this.message);
    this.addMsgToChat('tempPlayerName', this.message);
    this.message = '';
  }

  private scrollToBottom(): void {
    this.scroll.nativeElement.scrollTop = this.scroll.nativeElement.scrollHeight;
  }

}
