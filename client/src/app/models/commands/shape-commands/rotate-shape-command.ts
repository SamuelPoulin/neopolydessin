import { BaseShape } from '@models/shapes/base-shape';
import { EditorService } from '@services/editor.service';
import { Coordinate } from '@utils/math/coordinate';
import { ShapesCommand } from './shapes-command';

export class RotateShapeCommand extends ShapesCommand {
  private angle: number;
  private individual: boolean;
  private center: Coordinate;

  constructor(shapes: BaseShape[] | BaseShape, editorService: EditorService, angle: number, center?: Coordinate) {
    super(shapes, editorService);
    this.angle = angle;
    center ? (this.center = center) : (this.individual = true);
  }

  execute(): void {
    this.applyRotation(this.angle);
  }

  undo(): void {
    this.applyRotation(-this.angle);
  }

  private applyRotation(angle: number): void {
    this.shapes.forEach((shape) => {
      this.individual ? (shape.rotation += angle) : this.applyRotationOffset(shape, angle, this.center);
    });
  }

  private applyRotationOffset(shape: BaseShape, angle: number, center: Coordinate): void {
    shape.rotation += angle;
    shape.center = shape.center.rotate(angle, center);
  }
}
