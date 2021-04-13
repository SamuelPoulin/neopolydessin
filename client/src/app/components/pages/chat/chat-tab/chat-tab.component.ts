import { Component, Input, OnInit } from '@angular/core';
import { ChatRoom, ChatRoomType } from '@models/chat/chat-room';
import { ChatService } from '@services/chat.service';

@Component({
  selector: 'app-chat-tab',
  templateUrl: './chat-tab.component.html',
  styleUrls: ['./chat-tab.component.scss'],
})
export class ChatTabComponent implements OnInit {
  @Input() room: ChatRoom;

  closable: boolean;

  constructor(private chatService: ChatService) {
    this.closable = false;
  }

  ngOnInit() {
    if (this.room) {
      this.closable = this.room.type === ChatRoomType.PRIVATE || this.room.type === ChatRoomType.GROUP;
    } else {
      this.room = { name: '', id: '', type: ChatRoomType.GENERAL, messages: [] };
    }
  }

  closeRoom(e: Event) {
    e.stopPropagation();
    if (this.room.type === ChatRoomType.GROUP) {
      this.chatService.leaveChatRoom(this.room.name);
    } else {
      this.chatService.closeRoom(this.room.name);
    }
  }

  focusRoom() {
    this.chatService.focusRoom(this.room.name);
  }

  get selected() {
    return this.chatService.roomName === this.room.name;
  }
}
