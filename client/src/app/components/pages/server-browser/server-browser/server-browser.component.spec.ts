import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '../../../shared/shared.module';
import { StatusBarModule } from '../../../shared/status-bar/status-bar.module';
import { ServerBrowserComponent } from './server-browser.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('BrowserComponent', () => {
  let component: ServerBrowserComponent;
  let fixture: ComponentFixture<ServerBrowserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule, StatusBarModule, RouterTestingModule],
      declarations: [ServerBrowserComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
