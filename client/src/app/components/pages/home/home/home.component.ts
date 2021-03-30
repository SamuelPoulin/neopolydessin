import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { HomeKeyboardListener } from '@components/pages/home/home/home-keyboard-listener';
import { GameService } from '@services/game.service';
import { SocketService } from '@services/socket-service.service';
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
  private readonly keyboardListener: HomeKeyboardListener;

  constructor(
    private router: Router,
    private dialog: ModalDialogService,
    private socketService: SocketService,
    private gameService: GameService,
  ) {
    this.previousDrawings = false;
    this.modalIsOpened = false;
    this.guideModalType = ModalType.GUIDE;
    this.keyboardListener = new HomeKeyboardListener(this);
  }

  openModal(link: ModalType = ModalType.CREATE): void {
    this.dialog.openByName(link);
  }

  openPage(link: string): void {
    this.router.navigate([link]);
  }

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent): void {
    this.keyboardListener.handle(event);
  }

  get electronContainer(): Element | null {
    return document.querySelector('.container-after-titlebar');
  }

  createLobby(): void {
    this.gameService.isDrawer = true;
    this.socketService.createLobby('client-tres-lourd');
    this.router.navigate(['lobby']);
  }
}
