import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EditorService } from '@services/editor.service';
import { ModalDialogService } from '@services/modal/modal-dialog.service';
import { ModalType } from '@services/modal/modal-type.enum';

@Component({
  selector: 'app-picture-word-browser',
  templateUrl: './picture-word-browser.component.html',
  styleUrls: ['./picture-word-browser.component.scss'],
})
export class PictureWordBrowserComponent {
  constructor(private modalService: ModalDialogService, private router: Router, private editorService: EditorService) { }

  get electronContainer(): Element | null {
    return document.querySelector('.container-after-titlebar');
  }

  openEditor(): void {
    this.editorService.isFreeEdit = true;
    this.router.navigate(['/edit']);
  }

  openUpload(): void {
    this.modalService.openByName(ModalType.UPLOAD);
  }
}
