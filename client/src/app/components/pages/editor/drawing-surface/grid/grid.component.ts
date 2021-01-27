import { Component, Input } from '@angular/core';
import { EditorService } from '@services/editor.service';
import { GridProperties } from '@tool-properties/grid-properties/grid-properties';
import { GridVisibility } from '@tool-properties/grid-properties/grid-visibility.enum';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
})
export class GridComponent {
  static readonly SIZE_RATIO: number = 5;

  @Input() width: number;
  @Input() height: number;

  constructor(private editorService: EditorService) {}

  generateGridPath(size: number): string {
    return `M ${size} 0 L 0 0 0 ${size}`;
  }

  get largeSize(): number {
    return this.size * GridComponent.SIZE_RATIO;
  }

  get size(): number {
    return this.properties.size.value;
  }

  get opacity(): number {
    return this.visibility === GridVisibility.visible ? this.properties.opacity.value : 0;
  }

  get visibility(): GridVisibility {
    return this.properties.visibility.value;
  }

  get properties(): GridProperties {
    return this.editorService.gridProperties;
  }
}
