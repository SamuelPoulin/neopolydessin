import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '../../../shared/shared.module';
import { LobbyComponent } from './lobby.component';
import { StatusBarModule } from '../../../shared/status-bar/status-bar.module';
import { RouterTestingModule } from '@angular/router/testing';
import { ChatModule } from '@components/pages/chat/chat.module';
import { UserService } from '@services/user.service';
import { MockUserService } from '@services/user.service.spec';
import { GameService } from '@services/game.service';
import { MockGameService } from '@services/game.service.spec';

fdescribe('LobbyComponent', () => {
  let component: LobbyComponent;
  let fixture: ComponentFixture<LobbyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule, StatusBarModule, RouterTestingModule, ChatModule],
      declarations: [LobbyComponent],
      providers: [
        { provide: UserService, useValue: MockUserService },
        { provide: GameService, useValue: MockGameService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LobbyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
