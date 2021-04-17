import { Component } from '@angular/core';
import { ChatService } from '@services/chat.service';

@Component({
  selector: 'app-game-end',
  templateUrl: './game-end.component.html',
  styleUrls: ['./game-end.component.scss'],
})
export class GameEndComponent {
  constructor(public chatService: ChatService) {}

  get electronContainer(): Element | null {
    return document.querySelector('.container-after-titlebar');
  }
}
