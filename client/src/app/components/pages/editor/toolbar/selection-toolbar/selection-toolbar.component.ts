import { Component } from '@angular/core';
import { AbstractToolbarEntry } from '@components/pages/editor/toolbar/abstract-toolbar-entry/abstract-toolbar-entry';
import { EditorService } from '@services/editor.service';
import { SelectionToolProperties } from '@tool-properties/editor-tool-properties/selection-tool-properties';
import { ToolType } from '@tools/tool-type.enum';

@Component({
  selector: 'app-selection-toolbar',
  templateUrl: './selection-toolbar.component.html',
  styleUrls: ['./selection-toolbar.component.scss'],
})
export class SelectionToolbarComponent extends AbstractToolbarEntry<SelectionToolProperties> {
  constructor(protected editorService: EditorService) {
    super(editorService, ToolType.Select);
  }

  copy(): void {
    this.editorService.copySelectedShapes();
  }

  cut(): void {
    this.editorService.cutSelectedShapes();
  }

  duplicate(): void {
    this.editorService.duplicateSelectedShapes();
  }

  paste(): void {
    this.editorService.pasteClipboard();
  }

  selectAll(): void {
    this.editorService.selectAll();
  }

  delete(): void {
    this.editorService.deleteSelectedShapes();
  }

  get hasSelectedShapes(): boolean {
    return !!this.editorService.selection.shapes.length;
  }

  get hasShapesInClipboard(): boolean {
    return !!this.editorService.clipboard.length;
  }

  get hasShapes(): boolean {
    return !!this.editorService.shapes.length;
  }
}
