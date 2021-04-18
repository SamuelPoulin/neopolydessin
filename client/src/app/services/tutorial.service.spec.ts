import { async, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { APIService } from './api.service';
import { MockAPIService } from './api.service.spec';
import { EditorService } from './editor.service';
import { MockEditorService } from './editor.service.spec';
import { GameService } from './game.service';
import { MockGameService } from './game.service.spec';
import { TutorialService } from './tutorial.service';

export const MockTutorialService = jasmine.createSpyObj('TutorialService', {
  next: null,
});

describe('Tutorial', () => {
  let service: TutorialService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: APIService, useValue: MockAPIService },
        { provide: GameService, useValue: MockGameService },
        { provide: EditorService, useValue: MockEditorService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    service = TestBed.inject(TutorialService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
