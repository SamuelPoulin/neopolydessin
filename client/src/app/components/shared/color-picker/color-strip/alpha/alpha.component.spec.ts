/* tslint:disable:no-magic-numbers */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatInputModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ColorHistoryComponent } from 'src/app/components/shared/color-picker/color-history/color-history.component';
import { ColorPickerComponent } from 'src/app/components/shared/color-picker/color-picker.component';

import { AlphaComponent } from 'src/app/components/shared/color-picker/color-strip/alpha/alpha.component';
import { ColorLightnessComponent } from 'src/app/components/shared/color-picker/color-strip/color-lightness/color-lightness.component';
import { CustomInputComponent } from 'src/app/components/shared/inputs/custom-input/custom-input.component';
import { HexInputComponent } from 'src/app/components/shared/inputs/hex-input/hex-input.component';
import { NumberInputComponent } from 'src/app/components/shared/inputs/number-input/number-input.component';
import { Color } from 'src/app/utils/color/color';

describe('AlphaComponent', () => {
  let component: AlphaComponent;
  let fixture: ComponentFixture<AlphaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
      declarations: [
        ColorPickerComponent,
        ColorHistoryComponent,
        AlphaComponent,
        ColorLightnessComponent,
        NumberInputComponent,
        CustomInputComponent,
        HexInputComponent,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlphaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('changes only alpha on calculateNewColor', () => {
    component.color = Color.rgb(0.1, 0.2, 0.3, 0.4);
    const newColor = component.calculateNewColor(0.5);

    expect(newColor.a).toEqual(0.5);
    expect(newColor.hexString).toEqual(component.color.hexString);
  });

  it('redraws only when alpha changed', () => {
    const color1 = Color.rgb(0.1, 0.2, 0.3, 0.4);
    const color2 = Color.rgb(0.11, 0.22, 0.33, 0.44);

    expect(component.shouldRedraw(Color.rgb(color2.r, color2.g, color2.b, color1.a), color1)).toBe(false);
    expect(component.shouldRedraw(Color.rgb(color1.r, color1.g, color1.b, color2.a), color1)).toBe(true);
  });
});
