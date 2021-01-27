import { BaseShape } from 'src/app/models/shapes/base-shape';
import { Tool } from 'src/app/models/tools/tool';

export abstract class SimpleSelectionTool extends Tool {
  abstract selectShape(shape: BaseShape, rightClick: boolean): void;
}
