import { AfterViewInit, ChangeDetectorRef, Component, HostListener, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { Router } from '@angular/router';
import { LocalSaveService } from '@services/localsave.service';
import { DrawingSurfaceComponent } from 'src/app/components/pages/editor/drawing-surface/drawing-surface.component';
import { EditorParams } from 'src/app/components/pages/editor/editor/editor-params';
import { AbstractModalComponent } from 'src/app/components/shared/abstract-modal/abstract-modal.component';
import { ColorPickerComponent } from 'src/app/components/shared/color-picker/color-picker.component';

@Component({
  selector: 'app-create-drawing-modal',
  templateUrl: './create-drawing-modal.component.html',
  styleUrls: ['./create-drawing-modal.component.scss'],
})
export class CreateDrawingModalComponent extends AbstractModalComponent implements AfterViewInit {
  static readonly MARGIN_WIDTH: number = 68;
  static readonly MARGIN_HEIGHT: number = 12;
  @ViewChild('colorpicker', { static: true }) colorPicker: ColorPickerComponent;
  formGroup: FormGroup;
  private windowWidth: number;
  private windowHeight: number;
  width: string;
  height: string;

  constructor(
    public dialogRef: MatDialogRef<AbstractModalComponent>,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    super(dialogRef);
    this.formGroup = new FormGroup({});
    this.windowHeight = DrawingSurfaceComponent.DEFAULT_HEIGHT;
    this.windowWidth = DrawingSurfaceComponent.DEFAULT_WIDTH;
    this.width = this.windowWidth.toString();
    this.height = this.windowHeight.toString();
  }

  ngAfterViewInit(): void {
    this.onResize();
  }

  @HostListener('window:resize')
  onResize(): void {
    const shouldUpdate = this.width === this.windowWidth.toString() && this.height === this.windowHeight.toString();
    if (shouldUpdate) {
      this.windowWidth = window.innerWidth - CreateDrawingModalComponent.MARGIN_WIDTH;
      this.windowHeight = window.innerHeight - CreateDrawingModalComponent.MARGIN_HEIGHT;

      this.width = this.windowWidth.toString();
      this.height = this.windowHeight.toString();
      this.changeDetectorRef.detectChanges();
    }
  }

  onCreateClick(): void {
    const params: EditorParams = {
      width: this.width,
      height: this.height,
      color: this.colorPicker.color.hex,
      id: LocalSaveService.NEW_DRAWING_ID,
    };
    this.router.navigate(['/'], { skipLocationChange: true }).then((a) => this.router.navigate(['edit', params]));
    this.dialogRef.close();
  }
}
