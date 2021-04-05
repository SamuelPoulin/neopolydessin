import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@components/shared/shared.module';
import { GameService } from '@services/game.service';
import { MockGameService } from '@services/game.service.spec';
import { SocketService } from '@services/socket-service.service';
import { MockSocketService } from '@services/socket-service.service.spec';
import { UserService } from '@services/user.service';
import { MockUserService } from '@services/user.service.spec';
import { ChatComponent } from './chat.component';

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([{ path: 'login', redirectTo: '' }]), SharedModule],
      providers: [
        { provide: SocketService, useValue: MockSocketService },
        { provide: UserService, useValue: MockUserService },
        { provide: GameService, useValue: MockGameService },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
