import { Input } from '@angular/core';
import { ShapeError } from '@models/shapes/shape-error/shape-error';
import { EditorService } from '@services/editor.service';
import { ToolbarComponent } from 'src/app/components/pages/editor/toolbar/toolbar/toolbar.component';
import { ToolProperties } from 'src/app/models/tool-properties/tool-properties';
import { ToolType } from 'src/app/models/tools/tool-type.enum';

export abstract class AbstractToolbarEntry<T extends ToolProperties> {
  @Input() thicknessSliderStep: number;

  protected constructor(protected editorService: EditorService, protected type: ToolType) {
    this.thicknessSliderStep = ToolbarComponent.SLIDER_STEP;
  }

  get toolProperties(): T {
    const tool = this.editorService.tools.get(this.type);
    if (!tool) {
      throw ShapeError.typeNotFound(this.type);
    } else {
      return tool.toolProperties as T;
    }
  }
}
