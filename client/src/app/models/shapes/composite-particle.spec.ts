/* tslint:disable:no-string-literal no-magic-numbers */
import { Rectangle } from '@models/shapes/rectangle';
import { EditorUtils } from '@utils/color/editor-utils';
import { Coordinate } from '../../utils/math/coordinate';
import { CompositeParticle } from './composite-particle';

describe('CompositeParticle', () => {
  let compositeParticle: CompositeParticle;
  beforeEach(() => {
    compositeParticle = new CompositeParticle();
  });
  it('can read shape', () => {
    compositeParticle.spray();
    const comp2 = EditorUtils.createShape(JSON.parse(JSON.stringify(compositeParticle)));
    expect(Object.values(comp2)).toEqual(Object.values(compositeParticle));
  });
  it('should create an instance', () => {
    expect(compositeParticle).toBeTruthy();
  });
  it('should init with empty particles array', () => {
    expect(compositeParticle['particles'].length).toEqual(0);
  });
  it('should have radius of 1 on invalid input', () => {
    compositeParticle.radius = Number.NaN;
    expect(compositeParticle.radius).toEqual(1);
  });
  it('should have positive radius on negative input', () => {
    compositeParticle.radius = -1;
    expect(compositeParticle.radius).toEqual(1);
  });
  it('should add frequency amount of particles on spray call', () => {
    compositeParticle.spray(new Coordinate(), 10);
    expect(compositeParticle['particles'].length).toEqual(10);
  });
  it('should init with origin at 0,0', () => {
    expect(compositeParticle.origin).toEqual(new Coordinate());
  });
  it('should set origin relative to relative origin', () => {
    compositeParticle['particles'].push(new Rectangle(new Coordinate(5, 5), 1, 1));
    compositeParticle['particles'].push(new Rectangle(new Coordinate(10, 10), 1, 1));
    compositeParticle.origin = new Coordinate(5, 5);
    expect(compositeParticle.origin).toEqual(new Coordinate(5, 5));
  });
  it('should init with no offset', () => {
    expect(compositeParticle.offset).toEqual(compositeParticle.origin);
  });
  it('should have width determined by extremes of x', () => {
    compositeParticle['particles'].push(new Rectangle(new Coordinate(), 1, 1));
    compositeParticle['particles'].push(new Rectangle(new Coordinate(10, 10), 1, 1));
    expect(compositeParticle.width).toEqual(11);
  });
  it('should have height determined by extremes of y', () => {
    compositeParticle['particles'].push(new Rectangle(new Coordinate(), 1, 1));
    compositeParticle['particles'].push(new Rectangle(new Coordinate(10, 10), 1, 1));
    expect(compositeParticle.height).toEqual(11);
  });
  it('should have relative origin to min particle', () => {
    compositeParticle['particles'].push(new Rectangle(new Coordinate(), 1, 1));
    compositeParticle['particles'].push(new Rectangle(new Coordinate(10, 10), 1, 1));
    expect(compositeParticle['relativeOrigin']).toEqual(new Coordinate());
  });
});
