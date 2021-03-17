import { async, TestBed } from '@angular/core/testing';
import { LocalSaveService } from './localsave.service';

describe('LocalSaveService', () => {
  let service: LocalSaveService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({}).compileComponents();
  }));

  beforeEach(() => {
    service = TestBed.inject(LocalSaveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
