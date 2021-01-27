/* tslint:disable:no-magic-numbers */
import { ElementRef } from '@angular/core';
import { AbstractColorStripComponent } from 'src/app/components/shared/color-picker/color-strip/abstract-color-strip.component';
import { Color } from 'src/app/utils/color/color';
import { Coordinate } from 'src/app/utils/math/coordinate';
import createSpyObj = jasmine.createSpyObj;

describe('AbstractColorStripComponent', () => {
  class AbstractColorStripComponentImpl extends AbstractColorStripComponent {
    get value(): number {
      return 0;
    }

    canvas: ElementRef<HTMLCanvasElement>;
    getFillStyle(width: number, height: number): string | CanvasGradient | CanvasPattern {
      return 'white';
    }

    calculateNewColor(value: number): Color {
      return Color.RED;
    }

    shouldRedraw(color: Color): boolean {
      return false;
    }
  }

  const component: AbstractColorStripComponent = new AbstractColorStripComponentImpl();

  beforeEach(() => {
    component.renderingContext = createSpyObj('renderingContext', ['fillRect', 'strokeRect']);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get indicator style on draw indicator', () => {
    const fillStyleSpy = spyOn(component, 'getIndicatorFillStyle').and.callThrough();
    const strokeStyleSpy = spyOn(component, 'getIndicatorStrokeStyle').and.callThrough();
    component.drawIndicator(new Coordinate());

    expect(fillStyleSpy).toHaveBeenCalled();
    expect(strokeStyleSpy).toHaveBeenCalled();
  });

  it('should calculate correct indicator position', () => {
    const getValueSpy = spyOnProperty(component, 'value').and.returnValue(0.5);
    const getWidthSpy = spyOnProperty(component, 'width').and.returnValue(100);

    component.isVertical = false;
    const position = component.calculateIndicatorPosition();
    expect(getValueSpy).toHaveBeenCalled();
    expect(getWidthSpy).toHaveBeenCalled();
    expect(position.y).toEqual(0);
    expect(position.x).toEqual(0.5 * 100);
  });

  it('calculates new color on calculateColorFromMouseEvent', () => {
    const calculateNewColorSpy = spyOn(component, 'calculateNewColor');
    const getHeightSpy = spyOnProperty(component, 'height').and.returnValue(100);

    component.isVertical = true;
    component.calculateColorFromMouseEvent({ offsetY: 50 } as MouseEvent);

    expect(calculateNewColorSpy).toHaveBeenCalledWith(0.5);
    expect(getHeightSpy).toHaveBeenCalled();
  });

  it('can get width and height', () => {
    component.isVertical = false;
    component.thickness = 100;
    component.length = 400;

    expect(component.width).toEqual(400);
    expect(component.height).toEqual(100);
  });
});
