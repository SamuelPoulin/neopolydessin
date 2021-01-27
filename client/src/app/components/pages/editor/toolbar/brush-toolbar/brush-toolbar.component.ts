import { Component } from '@angular/core';
import { EditorService } from '@services/editor.service';
import { AbstractToolbarEntry } from 'src/app/components/pages/editor/toolbar/abstract-toolbar-entry/abstract-toolbar-entry';
import { BrushToolProperties } from 'src/app/models/tool-properties/creator-tool-properties/brush-tool-properties';
import { ToolType } from 'src/app/models/tools/tool-type.enum';

@Component({
  selector: 'app-brush-toolbar',
  templateUrl: './brush-toolbar.component.html',
  styleUrls: ['../toolbar/toolbar.component.scss'],
})
export class BrushToolbarComponent extends AbstractToolbarEntry<BrushToolProperties> {
  constructor(protected editorService: EditorService) {
    super(editorService, ToolType.Brush);
  }
}
