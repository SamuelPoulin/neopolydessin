import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@components/shared/shared.module';
import { UserService } from '@services/user.service';
import { MockUserService } from '@services/user.service.spec';

import { AccountNavbarComponent } from './account-navbar.component';

describe('AccountNavbarComponent', () => {
  let component: AccountNavbarComponent;
  let fixture: ComponentFixture<AccountNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule],
      declarations: [AccountNavbarComponent],
      providers: [{ provide: UserService, useValue: MockUserService }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
