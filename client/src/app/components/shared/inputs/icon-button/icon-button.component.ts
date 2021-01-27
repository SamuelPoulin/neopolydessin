import { Component, Input } from '@angular/core';
import { TooltipPosition } from '@angular/material/tooltip';
import { CustomInputComponent } from '@components/shared/inputs/custom-input/custom-input.component';

@Component({
  selector: 'icon-button',
  templateUrl: './icon-button.component.html',
  styleUrls: ['./icon-button.component.scss'],
})
export class IconButtonComponent extends CustomInputComponent {
  static readonly DEFAULT_IMG_SIZE: number = 24;
  @Input() iconName: string;
  @Input() src: string;
  @Input() disable: boolean;
  @Input() tooltipName: string;
  @Input() tooltipPosition: TooltipPosition;
  @Input() selected: boolean;
  @Input() imgHeight: number;
  @Input() imgWidth: number;

  constructor() {
    super();
    this.iconName = '';
    this.tooltipPosition = 'after';
    this.selected = false;
    this.disable = false;
    this.src = '';
    this.imgHeight = IconButtonComponent.DEFAULT_IMG_SIZE;
    this.imgWidth = IconButtonComponent.DEFAULT_IMG_SIZE;
  }
}
