import { Component } from '@angular/core';
import { EditorService } from '@services/editor.service';
import { FillToolProperties } from '@tool-properties/editor-tool-properties/fill-tool-properties';
import { AbstractToolbarEntry } from 'src/app/components/pages/editor/toolbar/abstract-toolbar-entry/abstract-toolbar-entry';
import { ToolType } from 'src/app/models/tools/tool-type.enum';

@Component({
  selector: 'app-fill-toolbar',
  templateUrl: './fill-toolbar.component.html',
  styleUrls: ['../toolbar/toolbar.component.scss'],
})
export class FillToolbarComponent extends AbstractToolbarEntry<FillToolProperties> {
  constructor(protected editorService: EditorService) {
    super(editorService, ToolType.ColorFill);
  }
}
