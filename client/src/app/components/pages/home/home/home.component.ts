import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { EditorParams } from '@components/pages/editor/editor/editor-params';
import { HomeKeyboardListener } from '@components/pages/home/home/home-keyboard-listener';
import { LocalSaveService } from '@services/localsave.service';
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

  constructor(private router: Router, private dialog: ModalDialogService, private localSaveService: LocalSaveService) {
    this.previousDrawings = false;
    this.modalIsOpened = false;
    this.guideModalType = ModalType.GUIDE;
    this.keyboardListener = new HomeKeyboardListener(this);
  }

  openModal(link: ModalType = ModalType.CREATE): void {
    this.dialog.openByName(link);
  }

  openPage(nextLink: string): void {
    this.router.navigate([nextLink]);
  }

  openGallery(): void {
    this.dialog.openByName(ModalType.GALLERY);
  }

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent): void {
    this.keyboardListener.handle(event);
  }

  continueDrawing(): void {
    const params: EditorParams = {
      width: this.localSaveService.drawing.width.toString(),
      height: this.localSaveService.drawing.height.toString(),
      color: this.localSaveService.drawing.color,
      id: LocalSaveService.LOCAL_DRAWING_ID,
    };
    this.router.navigate(['/'], { skipLocationChange: true }).then(() => this.router.navigate(['edit', params]));
  }

  get isDrawingNull(): boolean {
    return this.localSaveService.drawing == null;
  }
}
