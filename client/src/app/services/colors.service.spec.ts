/* tslint:disable:no-string-literal */
import { TestBed } from '@angular/core/testing';
import { SelectedColorType } from 'src/app/services/selected-color-type.enum';
import { Color } from 'src/app/utils/color/color';

import { ColorsService } from 'src/app/services/colors.service';

describe('ColorsService', () => {
  let service: ColorsService;
  beforeEach(() => TestBed.configureTestingModule({}));

  beforeEach(() => {
    service = TestBed.get(ColorsService);
    service['_colors'] = [Color.RED, Color.BLUE];
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can get color', () => {
    expect(service.getColor(0)).toEqual(Color.RED);
    expect(service.getColor(1)).toEqual(Color.BLUE);
    expect(service.primaryColor).toEqual(Color.RED);
    expect(service.secondaryColor).toEqual(Color.BLUE);
  });

  it('can swap colors', () => {
    service.swapColors();
    expect(service.primaryColor).toEqual(Color.BLUE);
    expect(service.secondaryColor).toEqual(Color.RED);
  });

  it('can set color by type', () => {
    service.setColorByType(Color.GREEN, SelectedColorType.secondary);
    expect(service.getColor(SelectedColorType.secondary)).toEqual(Color.GREEN);
    expect(service.secondaryColor).toEqual(Color.GREEN);
  });
});
