// tslint:disable: no-magic-numbers
import { async, TestBed } from '@angular/core/testing';
import { Drawing } from '@models/drawing';
import { LocalSaveService } from './localsave.service';

describe('LocalSaveService', () => {
  let service: LocalSaveService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({}).compileComponents();
  }));

  beforeEach(() => {
    service = TestBed.get(LocalSaveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save the drawing on the browsers internal storage', () => {
    const spy = spyOn(localStorage, 'setItem');
    const drawing: Drawing = new Drawing('test', [], '', '', 100, 100, '');
    service.takeSnapshot(drawing);

    expect(spy).toHaveBeenCalled();
  });

  it('should load the drawing from the browsers internal storage', () => {
    const drawing: Drawing = new Drawing('test', [], '', '', 100, 100, '');
    service.takeSnapshot(drawing);

    expect(service.drawing.name).toBe('test');
  });
});
