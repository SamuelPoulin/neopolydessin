import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '../../../shared/shared.module';
import { StatusBarModule } from '../../../shared/status-bar/status-bar.module';
import { ServerBrowserComponent } from './server-browser.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ServerBrowserModule } from '../server-browser.module';
import { SocketService } from '@services/socket-service.service';
import { MockSocketService } from '@services/socket-service.service.spec';

describe('BrowserComponent', () => {
  let component: ServerBrowserComponent;
  let fixture: ComponentFixture<ServerBrowserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([{ path: 'login', redirectTo: '' }]), SharedModule, StatusBarModule, ServerBrowserModule],
      providers: [{ provide: SocketService, useValue: MockSocketService }],
    }).compileComponents();
    fixture = TestBed.createComponent(ServerBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
