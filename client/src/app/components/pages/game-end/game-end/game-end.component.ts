import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AudiovisualService } from '@services/audiovisual.service';
import { ChatService } from '@services/chat.service';
import { GameService } from '@services/game.service';
import { ModalDialogService } from '@services/modal/modal-dialog.service';
import { ModalType } from '@services/modal/modal-type.enum';

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
    private dialog: ModalDialogService,
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

  openExport() {
    this.dialog.openByName(ModalType.EXPORT);
  }
}
