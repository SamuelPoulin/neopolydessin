import { Component, EventEmitter, Output } from '@angular/core';
import { ColorsService } from 'src/app/services/colors.service';
import { EditorService } from 'src/app/services/editor.service';
import { Color } from 'src/app/utils/color/color';

@Component({
  selector: 'app-color-history',
  templateUrl: './color-history.component.html',
  styleUrls: ['./color-history.component.scss'],
})
export class ColorHistoryComponent {
  @Output() colorSelectedEvent: EventEmitter<Color>;

  constructor(private editorService: EditorService) {
    this.colorSelectedEvent = new EventEmitter<Color>();
  }

  get colorHistory(): Color[] {
    return ColorsService.getColorHistory();
  }

  onClick(color: Color): void {
    this.editorService.colorsService.primaryColor = color;
    this.colorSelectedEvent.emit(color);
  }
  onRightClick(color: Color): void {
    this.editorService.colorsService.secondaryColor = color;
    this.colorSelectedEvent.emit(color);
  }
}
