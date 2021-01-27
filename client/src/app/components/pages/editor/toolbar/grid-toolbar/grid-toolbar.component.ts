import { Component } from '@angular/core';
import { EditorService } from '@services/editor.service';
import { GridProperties } from '@tool-properties/grid-properties/grid-properties';

@Component({
  selector: 'app-grid-toolbar',
  templateUrl: './grid-toolbar.component.html',
  styleUrls: ['../toolbar/toolbar.component.scss'],
})
export class GridToolbarComponent {
  properties: GridProperties;

  constructor(private editorService: EditorService) {
    this.properties = this.editorService.gridProperties;
  }
}
