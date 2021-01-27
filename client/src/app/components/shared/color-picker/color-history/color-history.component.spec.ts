import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ColorsService } from 'src/app/services/colors.service';
import { Color } from 'src/app/utils/color/color';

import { ColorHistoryComponent } from './color-history.component';

describe('ColorHistoryComponent', () => {
  let component: ColorHistoryComponent;
  let fixture: ComponentFixture<ColorHistoryComponent>;
  let selectedColors: ColorsService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ColorHistoryComponent],
      providers: [ColorsService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorHistoryComponent);
    selectedColors = TestBed.get(ColorsService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('can push color when limit reached', () => {
    for (let i = 0; i < ColorsService.MAX_HISTORY_LENGTH; i++) {
      ColorsService.pushHistory(i % 2 === 0 ? Color.RED : Color.GREEN);
    }
    expect(component.colorHistory[0]).toEqual(Color.RED);
    // tslint:disable-next-line:no-magic-numbers
    expect(component.colorHistory[9]).toEqual(Color.GREEN);
    ColorsService.pushHistory(Color.BLUE);
    expect(component.colorHistory[0]).toEqual(Color.GREEN);
    // tslint:disable-next-line:no-magic-numbers
    expect(component.colorHistory[9]).toEqual(Color.BLUE);
  });

  it('emits color selected on click', () => {
    const colorSelectedSpy = spyOn(component.colorSelectedEvent, 'emit');

    const button: DebugElement = fixture.debugElement.query(By.css('.color-history-button'));

    expect(button).not.toBeUndefined();
    button.nativeElement.click();
    expect(colorSelectedSpy).toHaveBeenCalled();
  });

  it('sets secondary color on right click', () => {
    ColorsService.getColorHistory().fill(Color.WHITE);
    selectedColors.secondaryColor = Color.BLACK;
    fixture.detectChanges();
    const button: DebugElement = fixture.debugElement.query(By.css('.color-history-button'));
    expect(selectedColors.secondaryColor).toEqual(Color.BLACK);
    button.triggerEventHandler('contextmenu', {});
    expect(selectedColors.secondaryColor).toEqual(Color.WHITE);
  });
});
