/* tslint:disable:no-string-literal */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { StatusBarModule } from '@components/shared/status-bar/status-bar.module';
import { SocketService } from '@services/socket-service.service';
import { MockSocketService } from '@services/socket-service.service.spec';
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
      imports: [SharedModule, RouterTestingModule, StatusBarModule],
      declarations: [HomeComponent],
      providers: [
        { provide: SocketService, useValue: MockSocketService },
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

  /* keyboard shortcuts */

  it('should handle keyboard event', () => {
    const keyDownSpy = spyOn(component['keyboardListener'], 'handle');

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));

    expect(keyDownSpy).toHaveBeenCalled();
  });

  it('can open modal with keyboard shortcut', () => {
    const openModalSpy = spyOn(component, 'openModal');
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'o', ctrlKey: true }));
    expect(openModalSpy).toHaveBeenCalled();
  });
});
