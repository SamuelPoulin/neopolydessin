import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from '@services/chat.service';
import { TutorialService, TutorialStep } from '@services/tutorial.service';
import { ModalDialogService } from 'src/app/services/modal/modal-dialog.service';
import { ModalType } from 'src/app/services/modal/modal-type.enum';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  previousDrawings: boolean;
  modalIsOpened: boolean;
  guideModalType: ModalType;

  constructor(
    private router: Router,
    private dialogService: ModalDialogService,
    public chatService: ChatService,
    public tutorialService: TutorialService,
  ) {
    this.previousDrawings = false;
    this.modalIsOpened = false;
    this.guideModalType = ModalType.GUIDE;
  }

  openPage(link: string): void {
    this.router.navigate([link]);
  }

  get electronContainer(): Element | null {
    return document.querySelector('.container-after-titlebar');
  }

  openGamemode() {
    this.dialogService.openByName(ModalType.CHOOSE_GAMEMODE);
    if (this.tutorialService.tutorialActive) {
      this.tutorialService.next(TutorialStep.CHOOSE_SETTINGS);
    }
  }
}
