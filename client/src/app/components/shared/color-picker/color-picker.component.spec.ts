/* tslint:disable:no-magic-numbers */
import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatInputModule } from '@angular/material';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ColorHistoryComponent } from 'src/app/components/shared/color-picker/color-history/color-history.component';
import { AlphaComponent } from 'src/app/components/shared/color-picker/color-strip/alpha/alpha.component';
import { ColorLightnessComponent } from 'src/app/components/shared/color-picker/color-strip/color-lightness/color-lightness.component';
import { CustomInputComponent } from 'src/app/components/shared/inputs/custom-input/custom-input.component';
import { HexInputComponent } from 'src/app/components/shared/inputs/hex-input/hex-input.component';
import { NumberInputComponent } from 'src/app/components/shared/inputs/number-input/number-input.component';
import { ColorsService } from 'src/app/services/colors.service';
import { Color } from 'src/app/utils/color/color';

import { ColorPickerComponent } from './color-picker.component';
import Spy = jasmine.Spy;

describe('ColorPickerComponent', () => {
  let component: ColorPickerComponent;
  let fixture: ComponentFixture<ColorPickerComponent>;
  let drawAllSpy: Spy;
  let colorSquareElement: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
      declarations: [
        ColorPickerComponent,
        ColorLightnessComponent,
        ColorHistoryComponent,
        AlphaComponent,
        NumberInputComponent,
        CustomInputComponent,
        HexInputComponent,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorPickerComponent);
    component = fixture.componentInstance;

    component.showHistory = true;
    component.size = 500;

    colorSquareElement = fixture.debugElement.query(By.css('#color-square'));
    drawAllSpy = spyOn(component, 'drawAll').and.callThrough();

    component.ngOnInit();
    fixture.detectChanges();
    drawAllSpy.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should draw indicator on draw all', () => {
    const drawSpy = spyOn(component, 'draw');
    const drawIndicatorSpy = spyOn(component, 'drawIndicator');
    component.drawAll();
    expect(drawSpy).toHaveBeenCalled();
    expect(drawIndicatorSpy).toHaveBeenCalled();
  });

  it('can calculate indicator position', () => {
    component.color = Color.hsl(120, 0.5, 1);
    component.size = 200;

    const position = component.calculateIndicatorPosition();

    expect(position.x).toEqual((120 / 360) * 200);
    expect(position.y).toEqual(0.5 * 200);
  });

  it('redraws only if hue or saturation is changed', () => {
    const color1 = Color.hsl(120, 0.5, 0.5, 0.5);
    const color2 = Color.hsl(120, 0.5, 0, 0);
    const color3 = Color.hsl(10, 0.5, 0.5, 0.5);
    const color4 = Color.hsl(120, 0, 0.5, 0.5);

    expect(component.shouldRedraw(color1, color1)).toEqual(false);
    expect(component.shouldRedraw(color2, color1)).toEqual(false);
    expect(component.shouldRedraw(color3, color1)).toEqual(true);
    expect(component.shouldRedraw(color4, color1)).toEqual(true);
  });

  it('should update color on colorChange with lightness component', () => {
    const colorLightnessComponent = fixture.debugElement.query(By.directive(ColorLightnessComponent)).componentInstance;
    const colorChangeSpy = spyOn(component, 'colorChange').and.callThrough();
    const l = 0.4;

    colorLightnessComponent.colorChanged.emit(Color.hsl(0, 0, l));
    fixture.detectChanges();

    expect(colorChangeSpy).toHaveBeenCalledWith(Color.hsl(0, 0, l));
    expect(component.color.l).toBe(l);
  });

  it('should update on RGB inputs change', () => {
    const redColorInputComponent: HexInputComponent = fixture.debugElement.query(By.css('#red-color-input')).componentInstance;
    const greenColorInputComponent: HexInputComponent = fixture.debugElement.query(By.css('#green-color-input')).componentInstance;
    const blueColorInputComponent: HexInputComponent = fixture.debugElement.query(By.css('#blue-color-input')).componentInstance;
    const colorChangeSpy = spyOn(component, 'rgbChange').and.callThrough();

    redColorInputComponent.onBlur('11');
    fixture.detectChanges();
    expect(colorChangeSpy).toHaveBeenCalledWith('11', 'r');

    greenColorInputComponent.onBlur('22');
    fixture.detectChanges();
    expect(colorChangeSpy).toHaveBeenCalledWith('22', 'g');

    blueColorInputComponent.onBlur('33');
    fixture.detectChanges();
    expect(colorChangeSpy).toHaveBeenCalledWith('33', 'b');

    expect(component.color.hex).toEqual('112233');
    expect(drawAllSpy).toHaveBeenCalledTimes(3);
  });

  it('should update on hex color input change', () => {
    const hexColorInputComponent: HexInputComponent = fixture.debugElement.query(By.css('#hex-color-input')).componentInstance;
    const hexChangeSpy = spyOn(component, 'hexChange').and.callThrough();
    const colorHex = 'ff22ff';

    hexColorInputComponent.onBlur(colorHex);
    fixture.detectChanges();

    expect(hexChangeSpy).toHaveBeenCalledWith(colorHex);
    expect(component.color.hex).toEqual(colorHex);
    expect(drawAllSpy).toHaveBeenCalled();
  });

  it('calls onMouseDown when mouse is down', () => {
    const mouseDownSpy = spyOn(component, 'onMouseDown').and.callThrough();
    colorSquareElement.triggerEventHandler('mousedown', { offsetX: 50, offsetY: 40 });

    expect(mouseDownSpy).toHaveBeenCalled();
  });

  it('can draw on mouse down', () => {
    component.onMouseDown({ offsetX: 50, offsetY: 40 } as MouseEvent);

    fixture.detectChanges();

    const h = (50 / 500) * 360;
    const s = 40 / 500;
    expect(component.color.h).toEqual(h);
    expect(component.color.s).toEqual(s);
    expect(drawAllSpy).toHaveBeenCalled();
  });

  it('calls onMouseMove when mouse is moved', () => {
    const mouseMoveSpy = spyOn(component, 'onMouseMove').and.callThrough();
    colorSquareElement.triggerEventHandler('mousemove', { offsetX: 50, offsetY: 40 });

    expect(mouseMoveSpy).toHaveBeenCalled();
  });

  it('can draw on mouse move if mouse is down', () => {
    component.onMouseDown({ offsetX: 100, offsetY: 100 } as MouseEvent);
    component.onMouseMove({ offsetX: 50, offsetY: 40 } as MouseEvent);

    fixture.detectChanges();

    const h = (50 / 500) * 360;
    const s = 40 / 500;
    expect(component.color.h).toEqual(h);
    expect(component.color.s).toEqual(s);
    expect(drawAllSpy).toHaveBeenCalledTimes(2);
  });

  it('does not draw on mouse move if mouse is not down', () => {
    const mouseMoveSpy = spyOn(component, 'onMouseMove').and.callThrough();
    component.onMouseMove({ offsetX: 50, offsetY: 40 } as MouseEvent);
    fixture.detectChanges();

    expect(drawAllSpy).not.toHaveBeenCalled();
    expect(mouseMoveSpy).toHaveBeenCalled();
  });

  it('detects mouse up event', () => {
    const mouseUpSpy = spyOn(component, 'onMouseUp').and.callThrough();
    window.dispatchEvent(new Event('mouseup'));
    expect(mouseUpSpy).toHaveBeenCalled();
  });

  it('does not draw on mouse move if mouse has been released', () => {
    const mouseMoveSpy = spyOn(component, 'onMouseMove').and.callThrough();

    component.onMouseDown({ offsetX: 100, offsetY: 100 } as MouseEvent);
    component.onMouseUp();
    component.onMouseMove({ offsetX: 50, offsetY: 40 } as MouseEvent);

    const h = (100 / 500) * 360;
    const s = 100 / 500;
    expect(component.color.h).toEqual(h);
    expect(component.color.s).toEqual(s);
    expect(drawAllSpy).toHaveBeenCalledTimes(1);
    expect(mouseMoveSpy).toHaveBeenCalled();
  });

  it('restores initial color on cancel', () => {
    component.initialColor = Color.RED;
    component.color = Color.GREEN;
    drawAllSpy.calls.reset();
    fixture.debugElement.nativeElement.querySelector('#btn-cancel').click();
    expect(component.color).toEqual(Color.RED);
    expect(drawAllSpy).toHaveBeenCalledTimes(1);
  });

  it('adds to color history on confirm', () => {
    component.initialColor = Color.RED;
    component.color = Color.GREEN;
    fixture.detectChanges();

    fixture.debugElement.nativeElement.querySelector('#btn-confirm').click();
    expect(ColorsService.getColorHistory()[9]).toEqual(Color.GREEN);
  });

  it('emits colorChanged on confirm', () => {
    const colorChangedSpy = spyOn(component.colorChanged, 'emit');
    component.initialColor = Color.RED;
    component.color = Color.GREEN;

    component.confirm();

    expect(colorChangedSpy).toHaveBeenCalledWith(Color.GREEN);
    expect(component.initialColor).toEqual(Color.GREEN);
  });

  it('shows ColorHistory if showHistory is true', () => {
    component.showHistory = false;
    fixture.detectChanges();
    let colorHistory = fixture.debugElement.nativeElement.querySelector('app-color-history');
    expect(colorHistory).toBeNull();
    expect(fixture.debugElement.nativeElement.querySelector('#btn-confirm')).toBeNull();
    expect(fixture.debugElement.nativeElement.querySelector('#btn-cancel')).toBeNull();

    component.showHistory = true;
    fixture.detectChanges();
    colorHistory = fixture.debugElement.nativeElement.querySelector('app-color-history');
    expect(fixture.debugElement.nativeElement.querySelector('#btn-confirm')).not.toBeNull();
    expect(fixture.debugElement.nativeElement.querySelector('#btn-cancel')).not.toBeNull();
    expect(colorHistory).not.toBeNull();
  });
});
