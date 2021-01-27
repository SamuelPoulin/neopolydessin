import { BaseShape } from '@models/shapes/base-shape';
import { EditorService } from '@services/editor.service';
import { Coordinate } from '@utils/math/coordinate';
import { ShapesCommand } from './shapes-command';

export class MoveShapeCommand extends ShapesCommand {
  private readonly shapeCoordinates: Coordinate[];
  delta: Coordinate;

  constructor(shapes: BaseShape[] | BaseShape, editorService: EditorService, delta: Coordinate = new Coordinate()) {
    super(shapes, editorService);
    this.shapeCoordinates = new Array<Coordinate>();
    this.shapes.forEach((shape) => {
      this.shapeCoordinates.push(Coordinate.copy(shape.origin));
    });
    this.delta = delta;
  }

  execute(): void {
    this.shapes.forEach((shape, index) => {
      shape.origin = Coordinate.add(this.shapeCoordinates[index], this.delta);
    });
  }

  undo(): void {
    this.shapes.forEach((shape, index) => {
      shape.origin = this.shapeCoordinates[index];
    });
  }
}
