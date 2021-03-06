import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { ToolbarType } from '@components/pages/editor/toolbar/toolbar/toolbar-type.enum';
import { TutorialService, TutorialStep } from '@services/tutorial.service';

import { Tool } from '@tools/tool';
import { ColorPickerComponent } from 'src/app/components/shared/color-picker/color-picker.component';
import { ToolType } from 'src/app/models/tools/tool-type.enum';
import { EditorService } from 'src/app/services/editor.service';
import { SelectedColorType } from 'src/app/services/selected-color-type.enum';
import { Color } from 'src/app/utils/color/color';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent {
  static readonly SLIDER_STEP: number = 0.1;

  @Input() stepThickness: number;

  @Input() currentToolType: ToolType;
  @Output() currentToolTypeChange: EventEmitter<ToolType> = new EventEmitter<ToolType>();

  @Output() editorBackgroundChanged: EventEmitter<Color>;
  @Output() chooseExportSaveButtonClicked: EventEmitter<boolean>;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  ToolType: typeof ToolType = ToolType;
  toolTypeKeys: string[] = Object.values(ToolType);

  // eslint-disable-next-line @typescript-eslint/naming-convention
  SelectedColorType: typeof SelectedColorType = SelectedColorType;
  selectedColor: SelectedColorType;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  ToolbarType: typeof ToolbarType = ToolbarType;
  toolbarType: ToolbarType;

  @ViewChild('drawer')
  private drawer: MatDrawer;

  @ViewChild('colorPicker')
  colorPicker: ColorPickerComponent;

  readonly toolbarIcons: Map<ToolType | string, string>;
  readonly toolbarNames: Map<ToolType | string, string>;

  constructor(public editorService: EditorService, private tutorialService: TutorialService) {
    this.stepThickness = ToolbarComponent.SLIDER_STEP;
    this.editorBackgroundChanged = new EventEmitter<Color>();
    this.selectedColor = SelectedColorType.primary;
    this.chooseExportSaveButtonClicked = new EventEmitter<boolean>();
    this.toolbarType = ToolbarType.other;

    this.toolbarIcons = new Map<ToolType | string, string>([
      [ToolType.Pen, 'edit'],
      [ToolType.Eraser, 'delete_outline'],
    ]);
    this.toolbarNames = new Map<ToolType | string, string>([
      [ToolType.Pen, 'Crayon'],
      [ToolType.Eraser, 'Efface'],
    ]);
  }

  toolButtonId(tool: string): string {
    return `btn-${tool}`;
  }

  open(): void {
    this.drawer.open();
  }

  close(): void {
    this.drawer.close();
  }

  handleColorChanged(eventColor: Color): void {
    this.color = eventColor;
    this.toolbarType = ToolbarType.other;
    this.close();
  }

  openChooseExportSave(): void {
    this.chooseExportSaveButtonClicked.emit(true);
  }

  selectTool(selection: string): void {
    const type = selection as ToolType;
    if (type) {
      this.currentToolType = type;
      this.toolbarType = ToolbarType.other;
      this.currentToolTypeChange.emit(type);
    }

    if (type === ToolType.Pen && this.tutorialService.tutorialActive && this.tutorialService.currentStep === TutorialStep.SELECT_TOOL) {
      this.tutorialService.next(TutorialStep.DRAW);
    }
  }

  editColor(selectedColorType: SelectedColorType): void {
    this.toolbarType = ToolbarType.colorPicker;
    this.open();
    this.selectedColor = selectedColorType;
  }

  editGrid(): void {
    this.toolbarType = ToolbarType.grid;
    this.open();
  }

  updateBackground(color: Color): void {
    this.editorBackgroundChanged.emit(color);
  }

  undo(): void {
    this.editorService.commandReceiver.undo();
    if (this.currentToolType) {
      (this.editorService.tools.get(this.currentToolType) as Tool).handleUndoRedoEvent(true);
    }
  }

  redo(): void {
    this.editorService.commandReceiver.redo();
    if (this.currentToolType) {
      (this.editorService.tools.get(this.currentToolType) as Tool).handleUndoRedoEvent(false);
    }
  }

  get drawerOpened(): boolean {
    return this.drawer && this.drawer.opened;
  }

  get primaryColor(): Color {
    return this.editorService.colorsService.primaryColor;
  }

  get secondaryColor(): Color {
    return this.editorService.colorsService.secondaryColor;
  }

  set color(color: Color) {
    this.editorService.colorsService.setColorByType(color, this.selectedColor);
  }

  get color(): Color {
    return this.editorService.colorsService.getColor(this.selectedColor);
  }

  get electronContainer(): Element | null {
    return document.querySelector('.container-after-titlebar');
  }
}
