import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { EditorService } from '@services/editor.service';
import { MockEditorService } from '@services/editor.service.spec';
import { ColorsService } from 'src/app/services/colors.service';
import { Color } from 'src/app/utils/color/color';

import { ColorHistoryComponent } from './color-history.component';

describe('ColorHistoryComponent', () => {
  let component: ColorHistoryComponent;
  let fixture: ComponentFixture<ColorHistoryComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ColorHistoryComponent],
        providers: [{ provide: EditorService, useClass: MockEditorService }],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorHistoryComponent);
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
    component.editorService.colorsService.secondaryColor = Color.BLACK;
    fixture.detectChanges();
    const button: DebugElement = fixture.debugElement.query(By.css('.color-history-button'));
    expect(component.editorService.colorsService.secondaryColor).toEqual(Color.BLACK);
    button.triggerEventHandler('contextmenu', {});
    expect(component.editorService.colorsService.secondaryColor).toEqual(Color.WHITE);
  });
});
