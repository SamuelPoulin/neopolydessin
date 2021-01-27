import { Component } from '@angular/core';
import { PolygonToolProperties } from '@tool-properties/creator-tool-properties/shape-tool-properties/polygon-tool-properties';
import { AbstractToolbarEntry } from 'src/app/components/pages/editor/toolbar/abstract-toolbar-entry/abstract-toolbar-entry';
import { ToolType } from 'src/app/models/tools/tool-type.enum';
import { EditorService } from '../../../../../services/editor.service';

@Component({
  selector: 'app-polygon-toolbar',
  templateUrl: './polygon-toolbar.component.html',
  styleUrls: ['../toolbar/toolbar.component.scss'],
})
export class PolygonToolbarComponent extends AbstractToolbarEntry<PolygonToolProperties> {
  constructor(protected editorService: EditorService) {
    super(editorService, ToolType.Polygon);
  }
}
