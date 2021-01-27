import { Component } from '@angular/core';
import { AbstractToolbarEntry } from 'src/app/components/pages/editor/toolbar/abstract-toolbar-entry/abstract-toolbar-entry';
import { SprayToolProperties } from 'src/app/models/tool-properties/creator-tool-properties/spray-tool-properties';
import { ToolType } from 'src/app/models/tools/tool-type.enum';
import { EditorService } from '../../../../../services/editor.service';

@Component({
  selector: 'app-spray-toolbar',
  templateUrl: './spray-toolbar.component.html',
  styleUrls: ['../toolbar/toolbar.component.scss'],
})
export class SprayToolbarComponent extends AbstractToolbarEntry<SprayToolProperties> {
  constructor(protected editorService: EditorService) {
    super(editorService, ToolType.Spray);
    this.thicknessSliderStep = 1;
  }
}
