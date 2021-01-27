import { SprayToolProperties } from '@tool-properties/creator-tool-properties/spray-tool-properties';
import { EditorService } from '../../../../services/editor.service';
import { CompositeParticle } from '../../../shapes/composite-particle';
import { CreatorTool } from '../creator-tool';

export class SprayTool extends CreatorTool {
  static readonly INTERVAL_REFRESH_VALUE: number = 20;
  shape: CompositeParticle;
  private interval: number;
  toolProperties: SprayToolProperties;

  constructor(editorService: EditorService) {
    super(editorService);
    this.toolProperties = new SprayToolProperties();
  }

  startShape(): void {
    super.startShape();
    this.shape.spray(this.mousePosition, this.toolProperties.frequency.value);
    this.interval = window.setInterval(() => {
      this.shape.spray(this.mousePosition, this.toolProperties.frequency.value);
    }, SprayTool.INTERVAL_REFRESH_VALUE);
  }

  initMouseHandler(): void {
    this.handleMouseDown = () => {
      if (!this.isActive) {
        this.startShape();
      }
    };
    this.handleMouseUp = () => {
      if (this.isActive) {
        window.clearInterval(this.interval);
        this.applyShape();
      }
    };
    this.handleMouseLeave = this.handleMouseUp;
  }

  protected updateProperties(): void {
    if (this.shape) {
      this.shape.primaryColor = this.editorService.colorsService.primaryColor;
      this.shape.secondaryColor = this.editorService.colorsService.primaryColor;
      this.shape.strokeWidth = this.toolProperties.strokeWidth.value;
      this.shape.updateProperties();
    }
  }

  createShape(): CompositeParticle {
    return new CompositeParticle(this.toolProperties.strokeWidth.value);
  }
}
