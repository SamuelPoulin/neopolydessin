import { async, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { GameService } from './game.service';

export const MockGameService = jasmine.createSpyObj('GameService', { state: of([]) });

describe('GameService', () => {
  let service: GameService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({}).compileComponents();
  }));

  beforeEach(() => {
    service = TestBed.inject(GameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
