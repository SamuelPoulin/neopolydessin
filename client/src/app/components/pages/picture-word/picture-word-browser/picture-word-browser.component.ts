import { Component } from '@angular/core';
import { ModalDialogService } from '@services/modal/modal-dialog.service';
import { ModalType } from '@services/modal/modal-type.enum';

@Component({
  selector: 'app-picture-word-browser',
  templateUrl: './picture-word-browser.component.html',
  styleUrls: ['./picture-word-browser.component.scss'],
})
export class PictureWordBrowserComponent {
  constructor(private modalService: ModalDialogService) {}

  get electronContainer(): Element | null {
    return document.querySelector('.container-after-titlebar');
  }

  openUpload(): void {
    this.modalService.openByName(ModalType.UPLOAD);
  }
}
