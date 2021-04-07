import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@components/shared/shared.module';
import { GameService } from '@services/game.service';
import { MockGameService } from '@services/game.service.spec';
import { SocketService } from '@services/socket-service.service';
import { MockSocketService } from '@services/socket-service.service.spec';
import { UserService } from '@services/user.service';
import { MockUserService } from '@services/user.service.spec';

import { HomeGamemodeComponent } from './home-gamemode.component';

describe('HomeGamemodeComponent', () => {
  let component: HomeGamemodeComponent;
  let fixture: ComponentFixture<HomeGamemodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule],
      declarations: [HomeGamemodeComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: SocketService, useValue: MockSocketService },
        { provide: UserService, useValue: MockUserService },
        { provide: GameService, useValue: MockGameService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeGamemodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
