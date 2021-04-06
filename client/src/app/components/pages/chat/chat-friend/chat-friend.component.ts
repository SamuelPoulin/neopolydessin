import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-chat-friend',
  templateUrl: './chat-friend.component.html',
  styleUrls: ['./chat-friend.component.scss'],
})
export class ChatFriendComponent {
  @Input() friend: any;
}
