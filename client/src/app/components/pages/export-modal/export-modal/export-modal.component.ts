import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { MatDialogRef } from '@angular/material/dialog';
import { SafeResourceUrl } from '@angular/platform-browser';
import { APIService } from '@services/api.service';
import { EditorService } from 'src/app//services/editor.service';
import { AbstractModalComponent } from 'src/app/components/shared/abstract-modal/abstract-modal.component';
import { ImageExportService } from 'src/app/services/image-export.service';
import { ExtensionType } from '../extension-type.enum';
import { FilterType } from '../filter-type.enum';

@Component({
  selector: 'app-export-modal',
  templateUrl: './export-modal.component.html',
  styleUrls: ['./export-modal.component.scss'],
})
export class ExportModalComponent extends AbstractModalComponent {
  selectedExtension: ExtensionType;
  extensions: string[] = Object.values(ExtensionType);
  href: SafeResourceUrl;
  fileName: string;
  formGroup: FormGroup;
  sendFormGroup: FormGroup;
  selectedFilter: FilterType;
  filters: string[] = Object.values(FilterType);
  userName: string;
  email: string;
  serializedString: string;

  constructor(
    public dialogRef: MatDialogRef<AbstractModalComponent>,
    private editorService: EditorService,
    private imageExportService: ImageExportService,
    private apiService: APIService,
    private notification: MatSnackBar,
  ) {
    super(dialogRef);
    editorService.clearShapesBuffer();
    this.fileName = '';
    this.email = '';
    this.userName = '';
    this.selectedExtension = ExtensionType.EMPTY;
    this.selectedFilter = FilterType.EMPTY;
    this.href = this.imageExportService.exportSVGElement(this.editorService.view, this.selectedFilter);
    this.formGroup = new FormGroup({});
    this.sendFormGroup = new FormGroup({});
    this.serializedString = '';
  }

  get fullName(): string {
    return this.fileName + '.' + this.selectedExtension;
  }

  addFilterToPreview(): void {
    const image = document.getElementById('preview') as HTMLImageElement;
    switch (this.selectedFilter) {
      case FilterType.EMPTY:
        image.style.filter = 'none';
        break;
      case FilterType.BLACKWHITE:
        image.style.filter = 'grayscale(100%)';
        break;
      case FilterType.BLUR:
        image.style.filter = 'blur(5px)';
        break;
      case FilterType.INVERT:
        image.style.filter = 'invert(100%)';
        break;
      case FilterType.SATURATE:
        image.style.filter = 'saturate(200%)';
        break;
      case FilterType.SEPIA:
        image.style.filter = 'sepia(100%)';
        break;
    }
    this.changeExtension();
  }

  changeExtension(): void {
    if (this.selectedExtension !== ExtensionType.EMPTY) {
      this.selectedExtension === ExtensionType.SVG
        ? (() => {
            this.href = this.imageExportService.exportSVGElement(this.editorService.view, this.selectedFilter);
            this.serializedString = this.imageExportService.sendSVGElement(this.editorService.view, this.selectedFilter);
          })()
        : this.imageExportService
            .exportImageElement(this.editorService.view, this.selectedExtension, this.selectedFilter)
            .then((data: string) => {
              this.href = data;
            });
    }
  }

  send(): void {
    const content = this.selectedExtension === ExtensionType.SVG ? this.serializedString : this.href.toString();

    this.emailValid
      ? this.apiService.sendEmail(this.userName, this.email, content, this.fullName, this.selectedExtension)
      : this.notification.open('Veuillez entrer un courriel gmail ou poly', '', {
          duration: 2000,
        });
  }

  get valid(): boolean {
    return !this.formGroup.invalid && this.selectedExtension !== ExtensionType.EMPTY;
  }
  get emailValid(): boolean {
    return this.sendFormGroup.valid && this.valid;
  }

  get previewURL(): SafeResourceUrl {
    return this.imageExportService.safeURL(this.editorService.view);
  }
}
