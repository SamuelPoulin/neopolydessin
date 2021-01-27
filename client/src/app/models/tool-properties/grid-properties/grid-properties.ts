import { GridVisibility } from '@tool-properties/grid-properties/grid-visibility.enum';
import { EnumProperty } from '@tool-properties/props/enum-property/enum-property';
import { NumericProperty } from '@tool-properties/props/numeric-property/numeric-property';
import { ToolProperties } from '@tool-properties/tool-properties';

export class GridProperties extends ToolProperties {
  static readonly DEFAULT_GRID_SIZE: number = 16;
  static readonly DEFAULT_GRID_OPACITY: number = 0.75;
  static readonly MAX_GRID_SIZE: number = 100;
  static readonly GRID_SIZE_INCREMENT: number = 5;
  static readonly MIN_OPACITY: number = 0.1;
  static readonly MAX_OPACITY: number = 1;

  size: NumericProperty;
  opacity: NumericProperty;
  visibility: EnumProperty<GridVisibility, GridVisibility>;

  constructor() {
    super();
    this.size = new NumericProperty(GridProperties.GRID_SIZE_INCREMENT, GridProperties.MAX_GRID_SIZE, GridProperties.DEFAULT_GRID_SIZE);
    this.opacity = new NumericProperty(GridProperties.MIN_OPACITY, GridProperties.MAX_OPACITY, GridProperties.DEFAULT_GRID_OPACITY);
    this.visibility = new EnumProperty(GridVisibility.visible, GridVisibility);
  }
}
