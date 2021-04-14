import { EventEmitter } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PlayerRole } from '../../../../common/communication/lobby';
import { GameService } from './game.service';
import { SocketService } from './socket-service.service';
import { MockSocketService } from './socket-service.service.spec';
import { UserService } from './user.service';
import { MockUserService } from './user.service.spec';

export const MockGameService = jasmine.createSpyObj('GameService', {
  resetTeams: null,
  canDraw: true,
});

MockGameService.roleChanged = new EventEmitter<PlayerRole>();
MockGameService.canGuessChanged = new EventEmitter<void>();
MockGameService.teams = [[], []];
MockGameService.scores = [
  { teamNumber: 0, score: 0 },
  { teamNumber: 1, score: 0 },
];

describe('GameService', () => {
  let service: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: SocketService, useValue: MockSocketService },
        { provide: UserService, useValue: MockUserService },
        GameService,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    service = TestBed.inject(GameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
