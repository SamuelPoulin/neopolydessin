export class ShapeError extends Error {
  static readonly SHAPE_ID_COLLISION_MSG: string = 'Shape Id collision error';
  static readonly TYPE_NOT_FOUND_MSG: string = 'Tool not found. Type: ';

  constructor(message: string) {
    super(message);
  }

  static idCollision(): ShapeError {
    return new ShapeError(this.SHAPE_ID_COLLISION_MSG);
  }

  static typeNotFound(type: string): ShapeError {
    return new ShapeError(this.TYPE_NOT_FOUND_MSG + type);
  }
}
