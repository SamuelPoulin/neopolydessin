/* tslint:disable:no-string-literal */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ChatModule } from '@components/pages/chat/chat.module';
import { StatusBarModule } from '@components/shared/status-bar/status-bar.module';
import { ChatService } from '@services/chat.service';
import { MockChatService } from '@services/chat.service.spec';
import { MockElectronService } from '@services/electron.service.spec';
import { GameService } from '@services/game.service';
import { MockGameService } from '@services/game.service.spec';
import { SocketService } from '@services/socket-service.service';
import { MockSocketService } from '@services/socket-service.service.spec';
import { UserService } from '@services/user.service';
import { MockUserService } from '@services/user.service.spec';
import { ElectronService } from 'ngx-electron';
import { ModalDialogService } from 'src/app/services/modal/modal-dialog.service';
import { SharedModule } from '../../../shared/shared.module';

import { HomeComponent } from './home.component';
import createSpyObj = jasmine.createSpyObj;

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let component: HomeComponent;
  let router: Router;
  const modalDialogServiceSpy = createSpyObj('ModalDialogService', ['openByName']);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule, StatusBarModule, ChatModule],
      declarations: [HomeComponent],
      providers: [
        { provide: SocketService, useValue: MockSocketService },
        { provide: UserService, useValue: MockUserService },
        { provide: GameService, useValue: MockGameService },
        { provide: ChatService, useValue: MockChatService },
        { provide: ElectronService, useValue: MockElectronService },
        {
          provide: ModalDialogService,
          useValue: modalDialogServiceSpy,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should route', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.openPage('test');

    expect(navigateSpy).toHaveBeenCalledWith(['test']);
  });
});
