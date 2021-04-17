import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AudiovisualService } from '@services/audiovisual.service';
import { ChatService } from '@services/chat.service';
import { GameService } from '@services/game.service';

@Component({
  selector: 'app-game-end',
  templateUrl: './game-end.component.html',
  styleUrls: ['./game-end.component.scss'],
})
export class GameEndComponent implements OnInit {
  readonly effectStartDelay: number = 250;

  constructor(
    public chatService: ChatService,
    private gameService: GameService,
    private audiovisualService: AudiovisualService,
    private router: Router,
  ) {}

  ngOnInit() {
    setTimeout(() => {
      if (this.gameService.lastGameEndState) {
        if (this.gameService.lastGameEndState.won) {
          this.audiovisualService.celebrate();
        } else {
          this.audiovisualService.cry();
        }
      } else {
        this.router.navigate(['']);
      }
    }, this.effectStartDelay);
  }

  get electronContainer(): Element | null {
    return document.querySelector('.container-after-titlebar');
  }

  get wonLastGame() {
    if (this.gameService.lastGameEndState) {
      return this.gameService.lastGameEndState.won;
    } else {
      return false;
    }
  }

  get lastGameScore() {
    if (this.gameService.lastGameEndState) {
      return this.gameService.lastGameEndState.score;
    } else {
      return 0;
    }
  }
}
