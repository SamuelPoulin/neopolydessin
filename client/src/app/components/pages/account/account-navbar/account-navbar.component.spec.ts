import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountNavbarComponent } from './account-navbar.component';

describe('AccountNavbarComponent', () => {
  let component: AccountNavbarComponent;
  let fixture: ComponentFixture<AccountNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountNavbarComponent ]
    })
    .compileComponents();
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
