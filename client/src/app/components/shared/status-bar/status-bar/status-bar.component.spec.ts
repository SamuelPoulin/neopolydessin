import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GameService } from '@services/game.service';
import { MockGameService } from '@services/game.service.spec';
import { TutorialService } from '@services/tutorial.service';
import { MockTutorialService } from '@services/tutorial.service.spec';
import { UserService } from '@services/user.service';
import { MockUserService } from '@services/user.service.spec';
import { SharedModule } from '../../shared.module';

import { StatusBarComponent } from './status-bar.component';

describe('StatusBarComponent', () => {
  let component: StatusBarComponent;
  let fixture: ComponentFixture<StatusBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule],
      declarations: [StatusBarComponent],
      providers: [
        { provide: UserService, useValue: MockUserService },
        { provide: GameService, useValue: MockGameService },
        { provide: TutorialService, useValue: MockTutorialService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
