import { Component } from '@angular/core';
import { EditorService } from '@services/editor.service';
import { AbstractToolbarEntry } from 'src/app/components/pages/editor/toolbar/abstract-toolbar-entry/abstract-toolbar-entry';
import { PenToolProperties } from 'src/app/models/tool-properties/creator-tool-properties/pen-tool-properties';
import { ToolType } from 'src/app/models/tools/tool-type.enum';

@Component({
  selector: 'app-pen-toolbar',
  templateUrl: './pen-toolbar.component.html',
  styleUrls: ['../toolbar/toolbar.component.scss'],
})
export class PenToolbarComponent extends AbstractToolbarEntry<PenToolProperties> {
  constructor(editorService: EditorService) {
    super(editorService, ToolType.Pen);
  }
}
