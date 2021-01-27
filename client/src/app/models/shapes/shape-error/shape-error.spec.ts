import { ShapeError } from '@models/shapes/shape-error/shape-error';

describe('ShapeError', () => {
  it('should create an instance', () => {
    expect(new ShapeError('msg')).toBeTruthy();
  });

  it('can create idCollision error', () => {
    expect(ShapeError.idCollision()).toEqual(new ShapeError(ShapeError.SHAPE_ID_COLLISION_MSG));
  });

  it('can create typeNotFound error', () => {
    expect(ShapeError.typeNotFound('test')).toEqual(new ShapeError(ShapeError.TYPE_NOT_FOUND_MSG + 'test'));
  });
});
