import { Component } from '@angular/core';
import { AbstractToolbarEntry } from '@components/pages/editor/toolbar/abstract-toolbar-entry/abstract-toolbar-entry';
import { EraserToolProperties } from '@tool-properties/editor-tool-properties/eraser-tool-properties';
import { ToolType } from 'src/app/models/tools/tool-type.enum';

import { EditorService } from '@services/editor.service';

@Component({
  selector: 'app-eraser-toolbar',
  templateUrl: './eraser-toolbar.component.html',
  styleUrls: ['../toolbar/toolbar.component.scss'],
})
export class EraserToolbarComponent extends AbstractToolbarEntry<EraserToolProperties> {
  constructor(protected editorService: EditorService) {
    super(editorService, ToolType.Eraser);
  }
}
