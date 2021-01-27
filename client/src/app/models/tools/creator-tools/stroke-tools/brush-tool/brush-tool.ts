import { BrushPath } from 'src/app/models/shapes/brush-path';
import { BrushToolProperties } from 'src/app/models/tool-properties/creator-tool-properties/brush-tool-properties';
import { EditorService } from 'src/app/services/editor.service';
import { StrokeTool } from '../stroke-tool';

export class BrushTool extends StrokeTool {
  shape: BrushPath;
  toolProperties: BrushToolProperties;

  constructor(editorService: EditorService) {
    super(editorService);
    this.toolProperties = new BrushToolProperties();
  }

  protected updateProperties(): void {
    super.updateProperties();
    this.shape.secondaryColor = this.editorService.colorsService.primaryColor;
    this.shape.strokeWidth = this.toolProperties.strokeWidth.value;
    this.shape.filter = this.toolProperties.texture.value;
    this.shape.updateProperties();
  }

  createShape(): BrushPath {
    const shape = new BrushPath(this.mousePosition);
    if (this.shape) {
      shape.filter = this.shape.filter;
    }
    return shape;
  }
}
