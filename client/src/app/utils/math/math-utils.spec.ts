/* tslint:disable:no-magic-numbers */

import { MathUtils } from '@utils/math/math-utils';

describe('MathUtils', () => {
  it('can fit', () => {
    expect(MathUtils.fit(10, 3, 7)).toEqual(7);
    expect(MathUtils.fit(7, 3, 7)).toEqual(7);
    expect(MathUtils.fit(5, 3, 7)).toEqual(5);
    expect(MathUtils.fit(3, 3, 7)).toEqual(3);
    expect(MathUtils.fit(-3, 3, 7)).toEqual(3);
  });

  it('can fit correct angle', () => {
    expect(MathUtils.fitAngle(200)).toBeCloseTo(200, 5);
  });
  it('can fit angle greater than 360', () => {
    expect(MathUtils.fitAngle(400)).toBeCloseTo(40, 5);
    expect(MathUtils.fitAngle(800)).toBeCloseTo(80, 5);
  });
  it('can fit angle smaller than 0', () => {
    expect(MathUtils.fitAngle(-100)).toBeCloseTo(260, 5);
    expect(MathUtils.fitAngle(-800)).toBeCloseTo(280, 5);
  });

  it('can get hex', () => {
    expect(MathUtils.toHex(255)).toEqual('ff');
    expect(MathUtils.toHex(255, 6)).toEqual('0000ff');
  });
});
