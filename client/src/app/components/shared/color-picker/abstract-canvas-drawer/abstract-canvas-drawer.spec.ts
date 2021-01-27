import { ElementRef, SimpleChange, SimpleChanges } from '@angular/core';
import { AbstractCanvasDrawer } from 'src/app/components/shared/color-picker/abstract-canvas-drawer/abstract-canvas-drawer';
import { Color } from 'src/app/utils/color/color';
import { Coordinate } from 'src/app/utils/math/coordinate';
import Spy = jasmine.Spy;
import createSpyObj = jasmine.createSpyObj;

describe('AbstractCanvasDrawer', () => {
  class AbstractCanvasDrawerImpl extends AbstractCanvasDrawer {
    canvas: ElementRef<HTMLCanvasElement>;

    calculateColorFromMouseEvent(event: MouseEvent): Color {
      return Color.RED;
    }

    draw(): void {
      return;
    }

    calculateIndicatorPosition(): Coordinate {
      return new Coordinate(0, 0);
    }

    drawIndicator(position: Coordinate): void {
      return;
    }

    shouldRedraw(color: Color): boolean {
      return color.compare(Color.RED);
    }
  }

  const component: AbstractCanvasDrawer = new AbstractCanvasDrawerImpl();
  let drawAllSpy: Spy;
  let updateColorSpy: Spy;

  beforeEach(() => {
    drawAllSpy = spyOn(component, 'drawAll').and.callThrough();
    updateColorSpy = spyOn(component, 'updateColor').and.callThrough();
    component.renderingContext = createSpyObj('renderingContext', ['']);
  });

  it('should draw after view init', () => {
    component.ngAfterViewInit();
    expect(drawAllSpy).toHaveBeenCalled();
  });

  it('should draw on color change', () => {
    component.ngOnChanges({
      color: {
        currentValue: Color.RED,
      } as SimpleChange,
    } as SimpleChanges);
    expect(drawAllSpy).toHaveBeenCalled();
  });

  it('should redraw on updateColor if shouldRedraw returns true', () => {
    component.updateColor(Color.RED);
    expect(drawAllSpy).toHaveBeenCalled();
  });

  it('should draw component and indicator on drawAll', () => {
    const drawSpy = spyOn(component, 'draw');
    const drawIndicatorSpy = spyOn(component, 'drawIndicator');
    component.drawAll();
    expect(drawSpy).toHaveBeenCalled();
    expect(drawIndicatorSpy).toHaveBeenCalled();
  });

  it('should not redraw if shouldRedraw returns false', () => {
    component.updateColor(Color.BLUE);
    expect(drawAllSpy).not.toHaveBeenCalled();
  });

  it('sets mouseIsDown to true when mouse is down', () => {
    component.onMouseDown({} as MouseEvent);
    expect(component.mouseIsDown).toEqual(true);
  });

  it('updates color on mouse down', () => {
    component.onMouseDown({} as MouseEvent);

    expect(updateColorSpy).toHaveBeenCalledWith(Color.RED);
  });

  it('updates color on mouse move if mouse is down', () => {
    component.onMouseDown({} as MouseEvent);
    component.onMouseMove({} as MouseEvent);

    expect(updateColorSpy).toHaveBeenCalledWith(Color.RED);
  });

  it('does not update color on mouse move if mouse is not down', () => {
    component.onMouseDown({} as MouseEvent);
    component.onMouseUp();
    component.onMouseMove({} as MouseEvent);

    expect(updateColorSpy).toHaveBeenCalledTimes(1);
  });

  it('updates color on color set', () => {
    component.color = Color.BLACK;
    expect(updateColorSpy).toHaveBeenCalledWith(Color.BLACK);
  });

  it('does not update color if color is undefined', () => {
    // @ts-ignore
    component._color = undefined;
    component.color = Color.BLACK;
    expect(updateColorSpy).not.toHaveBeenCalled();
  });

  it('sets mouseIsDown to false when mouse is up', () => {
    component.onMouseUp();
    expect(component.mouseIsDown).toEqual(false);
  });
});
